import winston from 'winston';
import config from './config';

const { createLogger, format, transports, addColors } = winston;
const { combine, timestamp, json, errors, colorize, printf } = format;

interface CustomLevels extends winston.Logger {
  shutdown: winston.LeveledLogMethod;
}

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    shutdown: 3,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    shutdown: 'magenta',
  },
};

addColors(customLevels.colors);

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
  levels: customLevels.levels,
  level: 'shutdown',
  format: config.env === 'production' ? jsonFormat : consoleFormat,
  transports: [
    new transports.Console({
      silent: config.env === 'test',
    }),
  ],
}) as CustomLevels;

export default logger;
