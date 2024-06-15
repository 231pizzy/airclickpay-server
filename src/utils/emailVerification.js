const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('../models/userModel');

const emailVerification = {
  sendConfirmationEmail: async (newUser) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: newUser.email,
        subject: 'Email Verification',
        html:`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #74DBEF;">Welcome to AIRCLICKPAY</h2>
        <p>Hi ${newUser.firstName},</p>
        <p>Please click the link below to verify your email:</p>
        <a href="${process.env.SITE_URL}/email/verification?emailToken=${newUser.emailToken}" style="display: inline-block; padding: 10px 20px; background-color: #74DBEF; color: #000000; text-decoration: none; border-radius: 5px;">VERIFY EMAIL</a>
    </div>`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Error sending confirmation email:', err);
    }
  },
  sendHawkPinEmail: async (newUser) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: newUser.email,
        subject: 'Incorrect Hawk PIN Entered',
        html:`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #74DBEF;">AIRCLICKPAY SUPPORT TEAM</h2>
        <p>Dear ${newUser.firstName},</p>
        <p>It seems as if you’ve entered an incorrect Hawk PIN. Please remember that after 2 more unsuccessful tries, your account will be temporarily disabled for 5 hours. If you need assistance, please contact our support team.</p>
        <p>Best Regard</p>
        <p>AirClickPay</p>
    </div>`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Error sending confirmation email:', err);
    }
  },

  sendBalanceUpdateEmail: async (user, transaction) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: 'Balance Updated',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #74DBEF; border-radius: 10px; padding: 20px;">
        <h2 style="color: #74DBEF;">Transaction Notification</h2>
        <p style="color: #000000;">Hi ${user.firstName},</p>
        <p style="color: #000000;">Your balance has been updated:</p>
        <hr style="border: 1px solid #74DBEF;">
        <p style="color: #000000;"><strong>Transaction amount:</strong> ${transaction.amount}</p>
        <p style="color: #000000;"><strong>New balance:</strong> ${user.walletBalance}</p>
        <hr style="border: 1px solid #74DBEF;">
        <p style="color: #000000;">For any inquiries, please contact our support team.</p>
    </div>`
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Error sending balance update email:', err);
    }
  },

  sendReminderEmails: async () => {
    try {
      // Find unverified users
      const unverifiedUsers = await User.find({ verified: false });

      // Iterate through unverified users and send reminder emails
      for (const user of unverifiedUsers) {
        // Check if verification link has expired
        if (user.verificationExpiration && user.verificationExpiration < Date.now()) {
          continue; // Skip sending reminder email if verification link has expired
        }

        // Check if user has already been reminded twice
        if (user.reminderCount >= 2) {
          continue; // Skip sending reminder email if user has already been reminded twice
        }

        // Calculate the time difference between now and the expiration date
        const timeDiff = user.verificationExpiration.getTime() - Date.now();

        // Calculate the number of milliseconds in a day
        const oneDay = 24 * 60 * 60 * 1000;

        // Calculate the time to send the first reminder (one day after expiration)
        const firstReminderTime = user.verificationExpiration.getTime() + oneDay;

        // Calculate the time to send the second reminder (two days after expiration)
        const secondReminderTime = user.verificationExpiration.getTime() + 2 * oneDay;

        // Send the first reminder if the current time is past the first reminder time
        if (Date.now() >= firstReminderTime) {
          // Send first reminder email
          // Increment reminder count
          user.reminderCount += 1;
          await user.save();

          // Create transporter and mailOptions
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASS,
            },
          });
          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Reminder: Verify Your Email',
            text: 'Please verify your email to access our services.',
          };

          // Send reminder email
          await transporter.sendMail(mailOptions);

          console.log(`First reminder email sent to ${user.email}`);
        }

        // Send the second reminder if the current time is past the second reminder time
        if (Date.now() >= secondReminderTime) {
          // Send second reminder email
          // Increment reminder count
          user.reminderCount += 1;
          await user.save();

          // Create transporter and mailOptions
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASS,
            },
          });
          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Reminder: Verify Your Email',
            text: 'Please verify your email to access our services.',
          };

          // Send reminder email
          await transporter.sendMail(mailOptions);

          console.log(`Second reminder email sent to ${user.email}`);
        }
      }
    } catch (err) {
      console.error('Error sending reminder emails:', err);
    }
  },

  // Schedule the reminder emails to be sent periodically (e.g., daily)
  scheduleReminderEmails: () => {
    cron.schedule('0 8 * * *', emailVerification.sendReminderEmails); // Runs every day at 8:00 AM
  },
};

// Start scheduling reminder emails
emailVerification.scheduleReminderEmails();

module.exports = emailVerification;
