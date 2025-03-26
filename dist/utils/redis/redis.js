"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../logger"));
dotenv_1.default.config();
const redis = new ioredis_1.default(process.env.REDIS_URL, {
    connectTimeout: 10000, // ✅ 10s timeout for Redis connection
    retryStrategy: (times) => Math.min(times * 50, 2000), // ✅ Retry backoff strategy
});
redis.on("connect", () => logger_1.default.info("🟢 Connected to Upstash Redis"));
redis.on("error", (err) => logger_1.default.error("❌ Redis Error:", err));
exports.default = redis;
