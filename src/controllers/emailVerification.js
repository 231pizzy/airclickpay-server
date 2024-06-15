const { User } = require('../models/userModel');
const emailVerification = require('../utils/emailVerification'); // Assuming you have an emailVerification utility

const verifyEmailController = {
  verifyEmail: async (req, res, next) => {
    try {
      const emailToken = req.body.emailToken;

      if (!emailToken) return res.status(400).json("Email token not found...");

      const user = await User.findOne({ emailToken });

      if (!user) {
        return res.status(404).json("Invalid token or account already verified.");
    }
      if (user) {
        if (user.emailToken === emailToken) {
          user.emailToken = null;
          user.verified = true;
          user.accountStatus = "active";

          await user.save();

          return res.status(200).json({
            message: "Email verification successful.",
            verified: user.verified,
            emailToken: user.emailToken,
            accountStatus: user.accountStatus
          });
        }
      } else {
        const userWithToken = await User.findOne({ emailToken: { $ne: null } });
        if (userWithToken) {
          await emailVerification.sendConfirmationEmail(userWithToken);
          return res.status(404).json("Email verification failed, a new verification email has been sent.");
        }
      }

      return res.status(404).json("Email verification failed");

    } catch (error) {
      next(error);
    }
  }
};

module.exports = verifyEmailController.verifyEmail;
