const express = require('express');
const router = express.Router();
const { getBalances } = require('../controllers/getBalance');

router.get('/get-balance/:userId', getBalances);

module.exports = router;
