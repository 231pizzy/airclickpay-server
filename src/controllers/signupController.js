const { User, validateUser } = require('../models/userModel');
const hashUtil = require('../utils/hashUtil');
const emailVerification = require('../utils/emailVerification');
const crypto = require('crypto')

const signupController = {
  signUp: async (req, res, next) => {
    try {
      // Validate request body using validateUser from userModel
      const { error } = validateUser(req.body);
      if (error) return res.status(400).json({ msg: error.details[0].message });

      const { firstName, lastName, email, hawkPin, country, phoneNumber, password } = req.body;

      // Check if user already exists
      const existingUserWithEmail = await User.findOne({ email: email.toLowerCase() });
      const existingUserWithPhone = await User.findOne({ phoneNumber });

  if (existingUserWithEmail) {
    return res.status(400).json({ error: "Email already exists." });
  }

  if (existingUserWithPhone) {
    return res.status(400).json({ error: "Phone number already exists." });
  }

   // Validate phone number

      // Hash password
      const hashedPassword = hashUtil.hashPassword(password);
      const hashedHawkPin = hashUtil.hashPassword(hawkPin);

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        country,
        hawkPin: hashedHawkPin,
        email: email.toLowerCase(), // Convert email to lowercase
        emailToken: crypto.randomBytes(64).toString("hex"),
        phoneNumber,
        password: hashedPassword,
      });

      // Save user
      await newUser.save();

      await emailVerification.sendConfirmationEmail(newUser);

      const { password: pass, ...rest } = newUser._doc;
      res.status(201).json({ success: true, user: rest });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = signupController;
