const moment = require('moment');
const { error } = require('../utils/logger');

async function globalExceptionHandler(err, req, res, next) {
  try {
    const status = err.status || 500;
    let errorMessage = err.message || 'Internal Server Error';

    // Log the error with error type and stack trace
    error(errorMessage, 'GlobalException', {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      errorName: err.name,
      cause: err.stack,
    });

    const errorResponse =
      process.env.NODE_ENV === 'development'
        ? {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method,
            errorName: err.name,
            message: errorMessage,
            stackTrace: err.stack,
          }
        : {
            statusCode: status,
            message: errorMessage,
          };

    res.status(status).json(errorResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = globalExceptionHandler;
