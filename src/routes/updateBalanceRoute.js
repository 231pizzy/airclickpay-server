const express = require('express');
const router = express.Router();
const { updateBalance } = require('../controllers/updateBalance');

router.post('/update-balance/:userId', updateBalance);

module.exports = router;
