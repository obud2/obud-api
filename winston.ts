import * as winston from 'winston';

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(info => {
  return `${info.timestamp} [${info.level}] ▶ ${info.message}`;
});

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const logger = winston.createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.colorize({ all: true }), logFormat),
  transports: [new winston.transports.Console()],
});

logger.stream = {
  // @ts-ignore
  write: message => {
    logger.info(message);
  },
};

export { logger };
