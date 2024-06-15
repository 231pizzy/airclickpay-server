const jwt = require('jsonwebtoken');
const hashUtil = require('../utils/hashUtil');
const {User} = require('../models/userModel');
const Token = require('../models/tokenModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const requestHawkPinToken = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.json({
        status: false,
        message: 'Invalid Email Address',
      });
    }

    // Generate a random token
    const user = existingUser._id;
    const token = await Token.findOne({ userId: user });
    if (token) await token.deleteOne();
    const resetToken = Math.floor(100000 + Math.random() * 900000);
    await new Token({ userId: user, token: resetToken }).save();

    // Set up nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Hawk Pin Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p style="color: #000000;">Dear ${existingUser.firstName},</p>
          <br>
          <p style="color: #000000;">We received your request to reset your Hawk Pin. Please use the below code to do just that:</p>
          <br>
          <p><strong style="color: #74DBEF;">${resetToken}</strong></p>
          <br>
          <p><em style="color: #000000;">NOTE: The code will expire in 30 minutes.</em></p>
          <br>
          <br>
          <p style="color: #000000;">Best Regards,</p>
          <br>
          <p style="color: #000000;">AirClickPay Team</p>
        </div>
      `,
    });

    res.json({
      status: true,
      message: 'Your Hawk Pin reset token has been sent to your provided email',
    });
  } catch (error) {
    res.json({
      status: false,
      message: `You've got some errors: ${error.message}`,
      error,
    });
  }
};

const hawkPinReset = async (req, res) => {
  console.log("backend called for hawkin reset")
  try {
    const body = req.body;
    let token = await Token.findOne({ token: body.token });
    console.log("token:", token)
    if (!token) {
      return res.json({
        status: false,
        message: 'Invalid token or expired token',
      });
    }
    const user = await User.findById(token.userId);
    const userEmail = user.email;

    const newHawkPin = body.hawkPin;
    const hashnewHawkPin = hashUtil.hashPassword(newHawkPin);
    await User.updateOne({ _id: token.userId }, { $set: { hawkPin: hashnewHawkPin } }, { new: true });
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
      to: userEmail,
      subject: ' HawkPIN Successfully Reset',
      html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p style="color: #000000;">Dear ${user.firstName},</p>
      <br>
      <p style="color: #000000;">Your HawkPIN has been successfully reset. Please note that your limit has been downgraded to NGN 5,000 for the next 24 hours. If you need assistance, please contact our support team.
      .</p>
      <br>
      <p style="color: #000000;">Please remember to keep your Hawk Pin secure and do not share it with anyone.</p>
      <br>
      <br>
      <p style="color: #000000;">Best Regards,</p>
      <br>
      <p style="color: #000000;">AirClickPay Team</p>
  </div> 
  `,
    });
    return res.json({
      status: true,
      message: 'Hawk Pin Updated Successfully',
    });
  } catch (error) {
    return res.json({
      status: false,
      message: `An error occured while updating hawk pin` + error,
      error,
    });
  }
};
module.exports = {
  requestHawkPinToken,
  hawkPinReset,
};
