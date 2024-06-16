const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');

const verifyToken = async (req, res) => {
  const { token } = req.body;
  console.log("token", token);
  if (!token) {
      return res.status(400).json({ valid: false, message: 'No token provided' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
          return res.status(400).json({ valid: false, message: 'Invalid token' });
      }
      res.json({ valid: true });
  } catch (err) {
      console.error('Error verifying token:', err);
      res.status(400).json({ valid: false, message: 'Invalid token' });
  }
};

module.exports = verifyToken;
