const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/userModel');
const hashUtil = require('../utils/hashUtil');
const emailVerification = require('../utils/emailVerification');

const signinController = {
  signIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ message: 'Invalid email address, Please enter your correct email address' });
      }

      // Check password
      const isMatch = await hashUtil.comparePassword(password, user.password);
      if (!isMatch) {
        console.log('Invalid password');
        return res.status(400).json({ message: 'Invalid password, Please enter your correct password' });
      }

      // Check if account status is active
      if (user.accountStatus === 'inactive') {
        await emailVerification.sendConfirmationEmail(user); 
        return res.status(403).json({ message: 'Account is not active. Confirmation email sent.' });
      }

      // Check if account status is supended
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({ message: 'Account is suspended. Please reset your HawkPIN to continue.' });
      }

        // Check if account status is disabled
        if (user.accountStatus === 'disabled') {
          return res.status(403).json({ message: `Account is disabled until ${user.disabledUntil}. Please try again later.` });
        }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, lastActivity: Date.now() }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // const hashedToken = await bcrypt.hash(token, 10);

      const { password: pass, ...rest } = user._doc;

      // Set token as cookie
      res.cookie("access_token", token, { httpOnly: true, secure: true, sameSite: 'Strict'})
        .status(200)
        .json({...rest, token});

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
};

module.exports = signinController;
