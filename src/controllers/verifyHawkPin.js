const { User } = require('../models/userModel');
const hashUtil = require('../utils/hashUtil');
const jwt = require('jsonwebtoken');
const emailVerification = require('../utils/emailVerification');

const verifyHawkPin = async (req, res) => {
  try {
    const { hawkPin } = req.body;
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).redirect('/signin');
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      console.error(err);
      res.clearCookie('access_token');
      return res.status(401).redirect('/login');
    }

    console.log("user Id:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ msg: 'Account suspended. Please reset your HawkPIN to continue.' });
    }

    // Check if account is disabled
    if (user.accountStatus === 'disabled') {
      const now = new Date();
      if (user.disabledUntil && user.disabledUntil > now) {
        return res.status(403).json({ msg: `Account is disabled until ${user.disabledUntil}. Please try again later.` });
      } else {
        // Reactivate account and reset verification attempts after the disabled period
        user.accountStatus = 'active';
        user.verificationAttempts = 2; // Start with 2 trials after reactivation
        user.disabledUntil = null;
        user.isInExtraTrialPhase = true; // Mark that the user is in the extra trial phase
        await user.save();
      }
    }

    // Check hawkPin
    const isMatch = await hashUtil.comparePassword(hawkPin, user.hawkPin);
    if (!isMatch) {
      user.verificationAttempts -= 1;

      if (user.verificationAttempts <= 0) {
        if (user.accountStatus === 'active' && !user.isInExtraTrialPhase) {
          // Transition from active to disabled with 2 trials
          user.accountStatus = 'disabled';
          user.disabledUntil = new Date(Date.now() + 5 * 60 * 60 * 1000);
          user.isInExtraTrialPhase = true; 
        } else if (user.accountStatus === 'active' && user.isInExtraTrialPhase) {
       
          user.accountStatus = 'suspended';
          return res.status(403).json({ msg: 'Account suspended. Please reset your HawkPIN to continue.' });
        }
        await user.save();
        return res.status(403).json({ msg: `Account disabled due to multiple incorrect HawkPIN attempts. Please try again by ${user.disabledUntil}.` });
      }

      await user.save();

      if (user.verificationAttempts === 2) {
        await emailVerification.sendHawkPinEmail(user);
      }

      return res.status(400).json({ msg: `Invalid HawkPIN. You have ${user.verificationAttempts} more attempts before your account is disabled.` });
    }

    // Reset verification attempts on successful login
    user.verificationAttempts = 4;
    user.isInExtraTrialPhase = false; // Reset the extra trial phase flag
    await user.save();

    // Generate new JWT token
    const newToken = jwt.sign(
      { userId: user.id, lastActivity: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie("access_token", newToken, { httpOnly: true });

    res.status(200).json({ msg: 'HawkPIN verified' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

module.exports = verifyHawkPin;
