const express = require('express');
const router = express.Router();
const verifyEmail = require('../controllers/emailVerification'); // Import the verifyEmail method

router.post('/verify-email', verifyEmail); // Use the verifyEmail method as the route handler

module.exports = router;
