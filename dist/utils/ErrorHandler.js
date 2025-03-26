"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errorhandler = void 0;
// Custom Error Class
class Errorhandler extends Error {
    constructor(message, statusCode = 500, data) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.Errorhandler = Errorhandler;
