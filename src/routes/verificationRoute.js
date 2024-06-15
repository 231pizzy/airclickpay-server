const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

router.post('/resend-verification-email', verificationController.resendVerificationEmail);

module.exports = router;
