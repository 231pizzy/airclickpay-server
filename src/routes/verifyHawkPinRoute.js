const express = require('express');
const router = express.Router();
const verifyHawkPin = require('../controllers/verifyHawkPin');

router.post('/verify-hawkpin', verifyHawkPin);

module.exports = router;