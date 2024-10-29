import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtailToken = process.env.LOGTAIL_SOURCE_TOKEN || '';
const logtail = new Logtail(logtailToken);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Only add Logtail in production
if (process.env.NODE_ENV === 'production' && logtailToken) {
  logger.add(new LogtailTransport(logtail));
}

export { logger }; 