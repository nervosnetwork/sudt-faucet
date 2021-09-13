import dotenv from 'dotenv';
import winston from 'winston';

const { createLogger, format, transports } = winston;

dotenv.config();

const logLevel = (() => {
  switch (process.env.NODE_ENV) {
    case undefined:
    case 'development':
      return 'debug';
    case 'production':
      return 'info';
    default:
      throw new Error('unknown value of env NODE_ENV');
  }
})();

const myFormat = format.printf(({ level, message, label, timestamp }) => {
  return label ? `${timestamp} [{$label}] ${level} ${message}` : `${timestamp} ${level} ${message}`;
});

export const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.json(),
    format.colorize(),
    format.simple(),
    myFormat,
  ),
  transports: [new transports.Console()],
});
