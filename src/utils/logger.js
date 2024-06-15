const winston = require('winston');
require('winston-daily-rotate-file');
const winstonMongoDB = require('winston-mongodb');
const moment = require('moment');

// Create transports instance
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context, errorName, stackTrace, ...rest }) => {
        let logMessage = `${timestamp} [${context}] ${level}: ${message}`;
        if (errorName) logMessage += `\nError Type: ${errorName}`;
        if (stackTrace) {
          const stackLines = stackTrace.split('\n');
          if (stackLines.length > 1) {
            const stackLine = stackLines[1].trim();
            const filePath = stackLine.substring(stackLine.indexOf('(') + 1, stackLine.lastIndexOf(':'));
            const lineNumber = stackLine.substring(stackLine.lastIndexOf(':') + 1, stackLine.lastIndexOf(')'));
            logMessage += `\nFile: ${filePath}, Line: ${lineNumber}`;
          }
        }
        if (Object.keys(rest).length > 0) logMessage += `\nAdditional Info: ${JSON.stringify(rest)}`;
        return logMessage;
      }),
    ),
  }),

  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),

  new winstonMongoDB.MongoDB({
    level: 'info',
    db: process.env.MONGO_URI,
    options: {
      useUnifiedTopology: true,
    },
    collection: 'logs',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
];

// Create and export the logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: winston.format.json(),
  transports,
});

// Define logging functions
function log(message, context) {
  const timestamp = moment().format();
  logger.info(message, { timestamp, context });
}

function error(msg, ctx, additional = {}) {
  const timestamp = moment().format();
  const { error, ...info } = additional;
  logger.error(msg, {
    timestamp,
    context: ctx,
    ...info,
    stackTrace: error?.stack,
  });
}

function warn(message, context, additionalInfo) {
  const timestamp = moment().format();
  logger.warn(message, { timestamp, context, ...additionalInfo });
}

function debug(message, context, additionalInfo) {
  const timestamp = moment().format();
  logger.debug(message, { timestamp, context, ...additionalInfo });
}

function info(message, context, additionalInfo) {
  const timestamp = moment().format();
  logger.info(message, { timestamp, context, ...additionalInfo });
}

module.exports = {
  logger,
  log,
  error,
  warn,
  debug,
  info,
};
