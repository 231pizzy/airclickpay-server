const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');

const checkInactivity = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;

    const user = await User.findById(req.user);
    if (!user) {
      return next();
    }

    // User is logged in, perform inactivity check
    const lastActivity = decoded.lastActivity;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - lastActivity > fiveMinutes) {
      return res.status(401).json({ showHawkPinModal: true });
    }

    req.session.lastActivity = now;

    next();
  } catch (err) {
    console.error(err);
    return next();
  }
};

module.exports = checkInactivity;
