const express = require('express');
const { createTransaction } = require('../controllers/CreateTransaction');
const router = express.Router();

router.post('/create-transaction', createTransaction);

module.exports = router;
