const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');

const verifyToken = async (req, res, next) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: 'No token provided' });
    }

    try {
      // Find the actual token stored in the user's cookies
      const actualToken = req.cookies.access_token;
      if (!actualToken) {
        return res.status(400).json({ valid: false, message: 'No actual token found' });
      }

      // Compare the hashed token with the actual token
      const isMatch = await bcrypt.compare(actualToken, token);
      if (!isMatch) {
        return res.status(400).json({ valid: false, message: 'Invalid token' });
      }

      // Verify the actual token
      const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
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
