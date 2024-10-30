import winston from 'winston';
import { LogtailTransport } from '@logtail/winston';
import { Logtail } from '@logtail/node';

// Create base logger
export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  ]
});

// Add Logtail in production only
if (process.env.NODE_ENV === 'production' && process.env.LOGTAIL_SOURCE_TOKEN) {
  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
  logger.add(new LogtailTransport(logtail));
}