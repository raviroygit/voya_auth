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
exports.authRoutes = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
function authRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        const controller = new auth_controller_1.AuthController();
        // Signup (magic link)
        fastify.post("/signup", controller.signup.bind(controller));
        fastify.put("/user", { preHandler: auth_1.authMiddleware }, controller.updateUser.bind(controller));
        // Verify magic link
        fastify.get("/magic", controller.verifyMagic.bind(controller));
        // Request OTP for login
        fastify.post("/login/otp", controller.requestOTP.bind(controller));
        // Verify OTP and login
        fastify.post("/login/verify-otp", controller.verifyOTP.bind(controller));
        // Refresh token endpoint
        fastify.post("/refresh-token", controller.refreshToken.bind(controller));
        fastify.get("/me", controller.getMe.bind(controller));
        fastify.post("/logout", controller.logout.bind(controller));
    });
}
