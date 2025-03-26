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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const next_1 = require("../middlewares/next");
const ErrorHandler_1 = require("../utils/ErrorHandler");
const user_model_1 = require("../models/user.model");
const encryption_1 = require("../utils/encryption");
const session_model_1 = require("../models/session.model");
const cache_1 = require("../utils/redis/cache");
const nanoid_1 = require("nanoid");
const authService = new auth_service_1.AuthService();
class AuthController {
    signup(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name, phone_number } = request.body;
                const user = yield user_model_1.User.findOne({ email });
                if (user) {
                    return (0, next_1.next)(reply, new ErrorHandler_1.Errorhandler("User already exist with email: " + email, 500));
                }
                yield authService.sendMagicLink(email, name, phone_number);
                reply.send({ message: "Magic link sent. Please check your email." });
            }
            catch (err) {
                return (0, next_1.next)(reply, new ErrorHandler_1.Errorhandler(err.message, 500));
            }
        });
    }
    verifyMagic(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = request.query;
                console.log("token", token);
                const user = yield authService.verifyMagicLink(token);
                if (!user)
                    return reply.code(400).send({ message: "Invalid token" });
                const sessionId = (0, encryption_1.encrypt)((0, nanoid_1.nanoid)());
                const expiresAt = new Date(Date.now() + 86400 * 1000);
                const ipAddress = request.ip || request.headers["x-forwarded-for"] || "Unknown";
                const userAgent = request.headers["user-agent"] || "Unknown";
                yield session_model_1.Session.create({
                    userId: user.id,
                    sessionId,
                    expiresAt,
                    ipAddress,
                    userAgent,
                });
                yield (0, cache_1.setCache)(`session:${sessionId}`, (0, encryption_1.encrypt)(user.id), 86400);
                reply
                    .setCookie("sso_token", sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production" ||
                        request.protocol === "https", // ✅ Use Secure only when running HTTPS
                    sameSite: "none",
                    domain: process.env.DOMAIN || "localhost",
                    path: "/",
                    maxAge: 86400, // ✅ Keeps cookie after refresh (24 hours)
                })
                    .send({ message: "Logged in", ipAddress, userAgent });
            }
            catch (err) {
                reply.code(500).send({ message: "Server error" });
            }
        });
    }
    requestOTP(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = request.body;
                // Adjust this part as needed. For MongoDB, you might query the User model.
                // const user = await authService.verifyOTP(email, 'dummy'); // Temporary placeholder; adjust accordingly.
                const user = yield user_model_1.User.findOne({ email }); // Temporary placeholder; adjust accordingly.
                if (!user) {
                    reply
                        .code(400)
                        .send({ message: "User does not exist. Please sign up first." });
                    return;
                }
                yield authService.sendOTP(email);
                reply.send({ message: "OTP sent to your email." });
            }
            catch (err) {
                return (0, next_1.next)(reply, new ErrorHandler_1.Errorhandler(err.message, 500));
            }
        });
    }
    refreshToken(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = request.body;
            try {
                // Temporarily set the authorization header with the refresh token.
                request.headers.authorization = `Bearer ${refreshToken}`;
                // Verify the token via request.jwtVerify.
                yield request.jwtVerify();
                // Get the decoded token from request.user.
                const decoded = request.user;
                const { userId } = decoded;
                // Validate the refresh token using your service logic.
                const user = yield authService.validateRefreshToken(userId, refreshToken);
                if (!user) {
                    reply.code(401).send({ message: "Invalid refresh token" });
                    return;
                }
                // Use the Fastify instance's jwt.sign() to issue a new access token.
                const jwtInstance = request.server.jwt;
                if (!jwtInstance) {
                    throw new Error("JWT instance is not available on the Fastify instance.");
                }
                const newAccessToken = jwtInstance.sign({ userId });
                reply.send({ accessToken: newAccessToken });
            }
            catch (err) {
                reply.code(401).send({ message: "Invalid refresh token" });
            }
        });
    }
    verifyOTP(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = request.body;
                const user = yield authService.verifyOTP(email, otp);
                if (!user) {
                    return reply.code(400).send({ message: "Invalid or expired OTP." });
                }
                const sessionId = (0, encryption_1.encrypt)((0, nanoid_1.nanoid)());
                const expiresAt = new Date(Date.now() + 86400 * 1000); // 24-hour expiration
                const ipAddress = request.ip || request.headers["x-forwarded-for"] || "Unknown";
                const userAgent = request.headers["user-agent"] || "Unknown";
                yield session_model_1.Session.create({
                    userId: user.id,
                    sessionId,
                    expiresAt,
                    ipAddress,
                    userAgent,
                });
                yield (0, cache_1.setCache)(`session:${sessionId}`, (0, encryption_1.encrypt)(user.id), 86400);
                reply
                    .setCookie("sso_token", sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production" ||
                        request.protocol === "https", // ✅ Use Secure only when running HTTPS
                    sameSite: "none",
                    domain: process.env.DOMAIN || "localhost",
                    path: "/",
                    maxAge: 86400, // ✅ Keeps cookie after refresh (24 hours)
                })
                    .send({ message: "Logged in successfully", token: sessionId });
            }
            catch (err) {
                return (0, next_1.next)(reply, new ErrorHandler_1.Errorhandler(err.message, 500));
            }
        });
    }
    getMe(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return reply.code(401).send({ message: "Unauthorized" });
                }
                // Remove "Bearer " prefix to get the actual token
                const sso_token = authHeader.split(" ")[1];
                if (!sso_token)
                    return reply.code(401).send({ message: "Not authenticated" });
                let userId = (0, encryption_1.decrypt)(yield (0, cache_1.getCache)(`session:${sso_token}`));
                if (!userId) {
                    const session = yield session_model_1.Session.findOne({
                        sessionId: sso_token,
                        isInvalidated: false,
                    });
                    if (!session)
                        return reply.code(401).send({ message: "Session expired" });
                    // ✅ Verify IP/User-Agent to prevent session hijacking
                    const currentIP = request.ip || request.headers["x-forwarded-for"] || "Unknown";
                    const currentUserAgent = request.headers["user-agent"] || "Unknown";
                    if (session.ipAddress !== currentIP ||
                        session.userAgent !== currentUserAgent) {
                        return reply
                            .code(401)
                            .send({ message: "Session hijacking detected" });
                    }
                    userId = session.userId;
                    yield (0, cache_1.setCache)(`session:${sso_token}`, (0, encryption_1.encrypt)(userId), 86400);
                    // ✅ Re-set the cookie to extend session validity
                    reply.setCookie("sso_token", sso_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production" ||
                            request.protocol === "https", // ✅ Use Secure only when running HTTPS
                        sameSite: "none",
                        domain: "localhost", // Ensure consistency with frontend
                        path: "/",
                        maxAge: 86400, // ✅ Extends the cookie expiration
                    });
                }
                const user = yield user_model_1.User.findOne({ _id: userId });
                reply.send({ user, token: sso_token });
            }
            catch (err) {
                console.log("err", err);
                return reply.code(500).send({ message: "Server error" });
            }
        });
    }
    logout(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sso_token } = request.cookies;
                if (!sso_token)
                    return reply.code(400).send({ message: "No session found" });
                yield (0, cache_1.deleteCache)(`session:${sso_token}`);
                yield session_model_1.Session.findOneAndUpdate({ sessionId: sso_token }, { isInvalidated: true, loggedOutAt: new Date() });
                reply
                    .clearCookie("sso_token", {
                    path: "/",
                    domain: process.env.DOMAIN || "localhost",
                })
                    .send({ message: "Logged out successfully" });
            }
            catch (err) {
                return reply.code(500).send({ message: "Server error" });
            }
        });
    }
}
exports.AuthController = AuthController;
