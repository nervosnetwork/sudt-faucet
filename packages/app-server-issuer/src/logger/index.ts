import dotenv from 'dotenv';
import winston from 'winston';

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

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
  defaultMeta: { service: 'issuer-server' },
  transports: [new winston.transports.Console()],
});
