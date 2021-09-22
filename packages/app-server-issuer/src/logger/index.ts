import dotenv from 'dotenv';
import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { createLogger, format, transports } = winston;

dotenv.config();

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

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
  return label ? `${timestamp} [${label}] ${level} ${message}` : `${timestamp} ${level} ${message}`;
});

const dailyRotateTransport: DailyRotateFile = new DailyRotateFile({
  dirname: './logs',
  filename: 'issuer-server-%DATE%.log',
  maxFiles: '30d',
});

export const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.json(),
    myFormat,
  ),
  transports: [dailyRotateTransport],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple(), myFormat),
    }),
  );
}

export function loggerWithModule(moduleName: string): Logger {
  return logger.child({ label: moduleName });
}
