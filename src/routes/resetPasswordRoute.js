const express = require('express');

const router = express.Router();

const { requestPasswordReset, passwordReset } = require('../controllers/resetPasswordController');
const { validateSignin } = require('../middlewares/validationMiddleware');

router.post('/reset', requestPasswordReset);
router.post('/resetpassword', validateSignin, passwordReset);

module.exports = router;
