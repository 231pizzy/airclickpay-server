const User = require('../models/userModel');
const emailVerification = require('../utils/emailVerification');

const verificationController = {
  resendVerificationEmail: async (req, res) => {
    try {
      const { email } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if user is already verified
      if (user.verified) {
        return res.status(400).json({ msg: 'User is already verified' });
      }

      // Generate a new verification token
      const newToken = await emailVerification.generateNewVerificationToken(user._id);

      // Resend verification email with the new token
      await emailVerification.sendConfirmationEmail(email, newToken);

      // Send success response
      res.status(200).json({ msg: 'Verification email sent successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
};

module.exports = verificationController;
