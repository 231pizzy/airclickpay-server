const express = require('express');
const router = express.Router();
const { signUp } = require('../controllers/signupController');
const { validateSignup } = require('../middlewares/validationMiddleware');

router.post('/register', validateSignup, signUp);

module.exports = router;
