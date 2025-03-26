"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('process.env.EMAIL_USER', process.env.EMAIL_SECURE === 'true');
exports.default = {
    app: {
        port: process.env.PORT || 3000,
        baseUrl: process.env.BASE_URL || 'http://localhost:8000'
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
        accessTokenTtl: '30m', // 30 minutes
        refreshTokenTtl: '7d' // 7 days
    },
    otp: {
        ttl: 5 * 60 * 1000 // 5 minutes in milliseconds
    },
    magicLink: {
        ttl: 15 * 60 * 1000 // 15 minutes in milliseconds
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.zoho.in',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: true,
        user: process.env.EMAIL_USER || "no-reply@nxtgenaidev.com",
        pass: process.env.EMAIL_PASS || 'a3A3CDqpuBhf'
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || ''
    }
};
