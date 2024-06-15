const express = require('express');

const router = express.Router();

const { requestHawkPinToken, hawkPinReset } = require('../controllers/resetHawkPinController');

router.post('/hawkpin-token', requestHawkPinToken);
router.post('/change-hawkpin', hawkPinReset);

module.exports = router;
