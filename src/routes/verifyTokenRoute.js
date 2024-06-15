const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

router.post('/verify-token', verifyToken);

module.exports = router;
