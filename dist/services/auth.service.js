"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const config_1 = __importDefault(require("../config/config"));
const user_model_1 = require("../models/user.model");
const crypto_util_1 = require("../utils/crypto.util");
const cache_1 = require("../utils/redis/cache");
const email_service_1 = require("./email.service");
class AuthService {
    /**
     * Sends a magic link email for first-time signup.
     * The magic token is stored in Redis with a TTL.
     */
    sendMagicLink(email, name, phone_number) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, crypto_util_1.generateToken)();
            const key = `magicToken:${token}`;
            // Store the magic token in Redis with TTL (in seconds)
            yield (0, cache_1.setCache)(key, { email, name, phone_number }, config_1.default.magicLink.ttl);
            const link = `${config_1.default.app.baseUrl}/auth/magic?token=${token}`;
            yield (0, email_service_1.sendMagicLinkEmail)(email, link);
        });
    }
    /**
     * Verifies the magic link token and creates (or retrieves) the user.
     * Deletes the token from the cache after verification.
     */
    verifyMagicLink(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `magicToken:${token}`;
            const email = yield (0, cache_1.getCache)(key);
            if (!email)
                return null;
            // Invalidate the token once it is used
            yield (0, cache_1.deleteCache)(key);
            // Find or create a user record in MongoDB
            let user = yield user_model_1.User.findOne({ email });
            if (!user) {
                user = new user_model_1.User({ name: "New User", email, isVerified: true });
                yield user.save();
            }
            else {
                // Update the user as verified if necessary
                if (!user.isVerified) {
                    user.isVerified = true;
                    yield user.save();
                }
            }
            return user;
        });
    }
    /**
     * Sends an OTP to the user's email for subsequent logins.
     * The OTP is cached in Redis with a TTL.
     */
    sendOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = (0, crypto_util_1.generateNumericOTP)(6);
            const key = `otp:${email}`;
            // Store the OTP in Redis with TTL (in seconds)
            yield (0, cache_1.setCache)(key, code, config_1.default.otp.ttl);
            yield (0, email_service_1.sendOTPEmail)(email, code);
        });
    }
    /**
     * Verifies the OTP and returns the user if valid.
     * Deletes the OTP from the cache after successful verification.
     */
    verifyOTP(email, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `otp:${email}`;
            const storedCode = yield (0, cache_1.getCache)(key);
            if (!storedCode || storedCode !== code)
                return null;
            // Invalidate the OTP after verification
            yield (0, cache_1.deleteCache)(key);
            // Find the user in MongoDB
            const user = yield user_model_1.User.findOne({ email });
            console.log("user", user);
            return user;
        });
    }
    /**
     * Updates a user's refresh token.
     * In production, this should be stored persistently.
     */
    updateRefreshToken(user, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            user.refreshToken = refreshToken;
            yield user.save();
        });
    }
    /**
     * Validates the provided refresh token for a user.
     */
    validateRefreshToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            if (!user || user.refreshToken !== token) {
                return null;
            }
            return user;
        });
    }
}
exports.AuthService = AuthService;
