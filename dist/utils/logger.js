"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
// Configure logger
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || "info",
    transport: process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
});
// Wrapper functions for different log levels
const log = {
    info: (msg, data) => logger.info(data || {}, msg),
    error: (msg, err) => logger.error(err || {}, msg),
    warn: (msg, data) => logger.warn(data || {}, msg),
    debug: (msg, data) => logger.debug(data || {}, msg),
};
exports.default = log;
