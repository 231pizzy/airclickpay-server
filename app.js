require('dotenv').config();
const path = require('path');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { logger, error, warn, info } = require('./src/utils/logger');
const db = require('./src/dbconfig/db');
const signupRoute = require('./src/routes/signupRoute');
const signinRoute = require('./src/routes/signinRoute');
const resetPasswordRoute = require('./src/routes/resetPasswordRoute');
const verificationRoute = require('./src/routes/verificationRoute');
const getBalanceRoute = require('./src/routes/getBalanceRoute');
const updateBalanceRoute = require('./src/routes/updateBalanceRoute');
const createTransactionRoute = require('./src/routes/createTransactionRoute');
const transactionHistroyRoute = require('./src/routes/transactionHistory');
const verifyEmailRoute = require('./src/routes/emailVerificationRoute');
const verifyTokenRoute = require('./src/routes/verifyTokenRoute');
const verifyHawkPinRoute = require('./src/routes/verifyHawkPinRoute');
const resetHawkPinRoute = require('./src/routes/resetHawkPinRoute');
const globalExceptionHandler = require('./src/middlewares/globalExceptionHandler');
const checkInactivity = require('./src/middlewares/checkInactivity');

const app = express();

// Connect to database
db();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => info(message.trim(), 'Global') } }));

// Configure CORS to allow requests from your frontend domain
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/', (req, res) => {
  info(`[${req.method}] ${req.url} - Health check passed`, 'HealthCheck');
  res.status(200).json({ status: 'OK', message: 'Health check passed' });
});

// Route that throws an error to test the global exception handler
app.get('/err', (req, res, next) => {
  try {
    const additionalInfo = { req };
    const error = new Error('This is a test error');
    error.additionalInfo = additionalInfo;
    throw error;
  } catch (err) {
    next(err);
  }
});

// Routes
app.use("/api/auth", signinRoute);
app.use("/api/auth", signupRoute);
app.use("/api/auth", verifyEmailRoute);
app.use("/api/auth", verifyTokenRoute);
app.use("/api/auth", verifyHawkPinRoute);
app.use("/api/auth", resetHawkPinRoute);
app.use(resetPasswordRoute);
app.use(verificationRoute);
app.use(getBalanceRoute);
app.use(updateBalanceRoute);
app.use(createTransactionRoute);
app.use(transactionHistroyRoute);

app.use(checkInactivity);

// Error handling middleware - should be the last middleware
app.use(globalExceptionHandler);

// Handling undefined routes
app.all('*', (req, res) => {
  warn(`404 Not Found - ${req.method} ${req.originalUrl}`, 'UndefinedRoute');
  res.status(404).json({
    errors: [{ error: `Can't find ${req.originalUrl} on this server` }],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  info(`Server is running on port ${port}`, 'Server');
});
