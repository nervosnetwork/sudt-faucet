import dotenv from 'dotenv';
import morgan, { StreamOptions } from 'morgan';
import winston, { Logger } from 'winston';

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

export function loggerWithModule(moduleName: string): Logger {
  return logger.child({ label: moduleName });
}

export const stream: StreamOptions = {
  write: (message) => logger.http(message),
};

export const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', { stream });
