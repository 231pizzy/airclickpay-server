const express = require('express');
const router = express.Router();
const { signIn } = require('../controllers/signinController');
const { validateSignin } = require('../middlewares/validationMiddleware');

router.post('/login', validateSignin, signIn);

module.exports = router;
