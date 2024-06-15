const express = require('express');
const router = express.Router();
const { getUserTransactionHistory } = require('../controllers/userTransactionHistory');

router.get('/transaction-history/:userId', getUserTransactionHistory);

module.exports = router;
