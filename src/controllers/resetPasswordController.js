const jwt = require('jsonwebtoken');
const hashUtil = require('../utils/hashUtil');
const {User} = require('../models/userModel');
const Token = require('../models/tokenModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailVerification = require('../utils/emailVerification');

const requestPasswordReset = async (req, res) => {
  try {
    const body = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({
      $or: [{ email: body.email }],
    });
    if (!existingUser) {
      return res.json({
        status: false,
        message: 'Invalid Email Address',
      });
    }
    // To generate a random number
    let user = existingUser._id;
    let token = await Token.findOne({ userId: user });
    if (token) await token.deleteOne();
    // let resetToken = crypto.randomBytes(3).toString("hex")
    let resetToken = Math.floor(100000 + Math.random() * 900000);
    await new Token({
      userId: user,
      token: resetToken,
    }).save();
    // const currentURL = process.env.CURRENT_URL;
    // const link = `${currentURL}/resetpassword/${user._id}/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    // const email = req.body;
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: body.email,
      subject: 'Password Reset Code',
      html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p style="color: #000000;">Hello,</p>
      <br>
      <p style="color: #000000;">We received your request to reset your password. Please use the below code to do just that:</p>
      <br>
      <p><strong style="color: #74DBEF;">${resetToken}</strong></p>
      <br>
      <p><em style="color: #000000;">NOTE: The code will expire in 30 minutes.</em></p>
      <br>
      <br>
      <p style="color: #000000;">Regards,</p>
      <br>
      <p style="color: #000000;">AirClickPay Team</p>
  </div>
  
  `,
    });

    res.json({
      status: true,
      message: 'Your password reset link has been sent to your provided email',
      resetToken,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: `You've got some errors` + error,
      error,
    });
  }
};
const passwordReset = async (req, res) => {
  try {
    const body = req.body;
    let token = await Token.findOne({ userId: body.userId, token: body.token });
    if (!token) {
      return res.json({
        status: false,
        message: 'Invalid token or expired token',
      });
    }
    const newPassword = body.password;
    const hashnewPassword = hashUtil.hashPassword(newPassword);
    await User.updateOne({ _id: token.userId }, { $set: { password: hashnewPassword } }, { new: true });
    await token.deleteOne();
    //sending password update notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: body.email,
      subject: ' Password Update Notification',
      html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p style="color: #000000;">Hello,</p>
      <br>
      <p style="color: #000000;">We are sending this email to notify you that your password has been successfully updated. If you did not request this change, please contact our support team immediately.</p>
      <br>
      <p style="color: #000000;">Please remember to keep your password secure and do not share it with anyone.</p>
      <br>
      <br>
      <p style="color: #000000;">Regards,</p>
      <br>
      <p style="color: #000000;">AirClickPay Team</p>
  </div> 
  `,
    });
    return res.json({
      status: true,
      message: 'Password Update Successful',
    });
  } catch (error) {
    return res.json({
      status: false,
      message: `An error occured while updating password` + error,
      error,
    });
  }
};
module.exports = {
  requestPasswordReset,
  passwordReset,
};
