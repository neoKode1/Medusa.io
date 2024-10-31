interface LogMetadata {
  requestId?: string;
  prefix?: string;
  [key: string]: unknown;
}

interface LoggerOptions {
  metadata?: LogMetadata;
}

class Logger {
  private metadata: LogMetadata;

  constructor(options: LoggerOptions = {}) {
    this.metadata = options.metadata || {};
  }

  private formatMessage(level: string, message: string, metadata: LogMetadata = {}): string {
    const timestamp = new Date().toISOString();
    const combinedMetadata = { ...this.metadata, ...metadata };
    const requestId = combinedMetadata.requestId ? ` [${combinedMetadata.requestId}]` : '';
    const prefix = combinedMetadata.prefix ? ` [${combinedMetadata.prefix}]` : '';
    
    return `[${timestamp}] [${level}]${prefix}${requestId} ${message}`;
  }

  child(metadata: LogMetadata): Logger {
    return new Logger({
      metadata: { ...this.metadata, ...metadata }
    });
  }

  info(message: string, metadata?: LogMetadata): void {
    /* eslint-disable-next-line no-console */
    console.log(this.formatMessage('INFO', message, metadata));
  }

  error(message: string, metadata?: LogMetadata): void {
    /* eslint-disable-next-line no-console */
    console.error(this.formatMessage('ERROR', message, metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    /* eslint-disable-next-line no-console */
    console.warn(this.formatMessage('WARN', message, metadata));
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable-next-line no-console */
      console.debug(this.formatMessage('DEBUG', message, metadata));
    }
  }
}

export const logger = new Logger({
  metadata: { prefix: 'MEDUSA' }
});

export default logger;
