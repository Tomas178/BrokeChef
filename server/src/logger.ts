import winston from 'winston';
import config from './config';

const { createLogger, format, transports } = winston;
const { combine, timestamp, json, errors, colorize, printf } = format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: () => new Date().toISOString() }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const jsonFormat = combine(
  timestamp({ format: () => new Date().toISOString() }),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: 'info',
  format: config.env === 'production' ? jsonFormat : consoleFormat,
  transports: [
    new transports.Console({
      silent: config.env === 'test',
    }),
  ],
});

export default logger;
