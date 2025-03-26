import pino from "pino";

// Configure logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

// Wrapper functions for different log levels
const log = {
  info: (msg: string, data?: any) => logger.info(data || {}, msg),
  error: (msg: string, err?: Error | any) => logger.error(err || {}, msg),
  warn: (msg: string, data?: any) => logger.warn(data || {}, msg),
  debug: (msg: string, data?: any) => logger.debug(data || {}, msg),
};

export default log;
