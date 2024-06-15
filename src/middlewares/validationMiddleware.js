const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phoneNumber')
    .matches(/^[7-9]\d{9}$/)
    .withMessage('Phone number must start with 7, 8, or 9 and consist of 10 digits'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  // Add more validations as needed
];

const validateSignin = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password is required'),
  // Add more validations as needed
];

const validationMiddleware = {
  validateSignup,
  validateSignin,
  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
};

module.exports = validationMiddleware;
