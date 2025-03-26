"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const ErrorHandler_1 = require("../utils/ErrorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
// Global Fastify Error Handler
const ErrorMiddleware = (reply, error) => {
    if (error instanceof ErrorHandler_1.Errorhandler) {
        error.statusCode = error.statusCode || 500;
        error.message = error.message || "Internal server error";
        // wrong mongodb id error
        if (error.name === "CastError") {
            const message = `Resource not found. Invalid`;
            error = new ErrorHandler_1.Errorhandler(message, 400);
        }
        // Duplicate key error
        if (error.code === 11000) {
            const message = `Duplicate ${Object.keys(error.keyValue)} entered`;
            error = new ErrorHandler_1.Errorhandler(message, 400);
        }
        // wrong jwt error
        if (error.name === "JsonWebTokenError") {
            const message = `Json web token is invalid, try again`;
            error = new ErrorHandler_1.Errorhandler(message, 400);
        }
        //JWT expired error
        if (error.name === "TokenExpiredError") {
            const message = `Json web token is expired, try again`;
            error = new ErrorHandler_1.Errorhandler(message, 400);
        }
        logger_1.default.warn(error.message, error.data);
        return reply.status(error.statusCode).send(Object.assign({ success: false, message: error.message }, (error.data && { data: error.data })));
    }
    logger_1.default.error("Unhandled error", error);
    return reply.status(500).send({
        success: false,
        message: "Internal Server Error",
    });
};
exports.ErrorMiddleware = ErrorMiddleware;
