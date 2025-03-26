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
exports.authMiddleware = authMiddleware;
const encryption_1 = require("../utils/encryption");
const cache_1 = require("../utils/redis/cache");
const user_model_1 = require("../models/user.model");
const session_model_1 = require("../models/session.model");
function authMiddleware(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token = request.cookies.sso_token || null;
            const authHeader = request.headers.authorization;
            if (!token && authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
            if (!token) {
                return reply.code(401).send({ message: "Unauthorized" });
            }
            let userId = (0, encryption_1.decrypt)(yield (0, cache_1.getCache)(`session:${token}`));
            if (!userId) {
                const session = yield session_model_1.Session.findOne({ sessionId: token, isInvalidated: false });
                if (!session) {
                    return reply.code(401).send({ message: "Session expired" });
                }
                userId = session.userId;
            }
            const user = yield user_model_1.User.findById(userId);
            if (!user) {
                return reply.code(401).send({ message: "User not found" });
            }
            request.user = user;
        }
        catch (err) {
            reply.code(500).send({ message: "Server error" });
        }
    });
}
