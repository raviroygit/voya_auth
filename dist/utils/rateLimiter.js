"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRateLimiter = setupRateLimiter;
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
function setupRateLimiter(fastify) {
    fastify.register(rate_limit_1.default, {
        max: 100,
        timeWindow: "30 minute",
        keyGenerator: (req) => req.ip,
        errorResponseBuilder: () => ({
            message: "Too many login attempts. Try again later.",
        }),
    });
}
