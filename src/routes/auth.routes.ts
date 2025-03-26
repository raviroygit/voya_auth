import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController();

  // Signup (magic link)
  fastify.post("/signup", controller.signup.bind(controller));

  fastify.put("/user",{ preHandler: authMiddleware }, controller.updateUser.bind(controller));

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
}
