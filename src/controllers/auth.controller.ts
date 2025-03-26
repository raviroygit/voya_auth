import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { next } from "../middlewares/next";
import { Errorhandler } from "../utils/ErrorHandler";
import { User } from "../models/user.model";
import { decrypt, encrypt } from "../utils/encryption";
import { Session } from "../models/session.model";
import { deleteCache, getCache, setCache } from "../utils/redis/cache";
const { nanoid } = require("nanoid/async");

const authService = new AuthService();

export class AuthController {
  async signup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { email, name, phone_number } = request.body as {
        email: string;
        name: string;
        phone_number: string;
      };
      const user = await User.findOne({ email });
      if (user) {
        return next(
          reply,
          new Errorhandler("User already exist with email: " + email, 500)
        );
      }
      await authService.sendMagicLink(email, name, phone_number);
      reply.send({ message: "Magic link sent. Please check your email." });
    } catch (err: any) {
      return next(reply, new Errorhandler(err.message, 500));
    }
  }

  async verifyMagic(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { token } = request.query as { token: string };
      console.log("token", token);
      const user = await authService.verifyMagicLink(token);
      if (!user) return reply.code(400).send({ message: "Invalid token" });

      const sessionId = encrypt(nanoid());
      const expiresAt = new Date(Date.now() + 86400 * 1000);

      const ipAddress =
        request.ip || request.headers["x-forwarded-for"] || "Unknown";
      const userAgent = request.headers["user-agent"] || "Unknown";

      await Session.create({
        userId: user.id,
        sessionId,
        expiresAt,
        ipAddress,
        userAgent,
      });

      await setCache(`session:${sessionId}`, encrypt(user.id), 86400);

      reply
        .setCookie("sso_token", sessionId, {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production" ||
            request.protocol === "https", // ✅ Use Secure only when running HTTPS
          sameSite: "none",
          domain: process.env.DOMAIN || "localhost",
          path: "/",
          maxAge: 86400, // ✅ Keeps cookie after refresh (24 hours)
        })
        .send({ message: "Logged in", ipAddress, userAgent });
    } catch (err) {
      reply.code(500).send({ message: "Server error" });
    }
  }

  async requestOTP(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email } = request.body as { email: string };
      // Adjust this part as needed. For MongoDB, you might query the User model.
      // const user = await authService.verifyOTP(email, 'dummy'); // Temporary placeholder; adjust accordingly.
      const user = await User.findOne({ email }); // Temporary placeholder; adjust accordingly.

      if (!user) {
        reply
          .code(400)
          .send({ message: "User does not exist. Please sign up first." });
        return;
      }
      await authService.sendOTP(email);
      reply.send({ message: "OTP sent to your email." });
    } catch (err: any) {
      return next(reply, new Errorhandler(err.message, 500));
    }
  }

  async refreshToken(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { refreshToken } = request.body as { refreshToken: string };
    try {
      // Temporarily set the authorization header with the refresh token.
      request.headers.authorization = `Bearer ${refreshToken}`;
      // Verify the token via request.jwtVerify.
      await request.jwtVerify<{ userId: string }>();

      // Get the decoded token from request.user.
      const decoded = request.user as { userId: string };
      const { userId } = decoded;

      // Validate the refresh token using your service logic.
      const user = await authService.validateRefreshToken(userId, refreshToken);
      if (!user) {
        reply.code(401).send({ message: "Invalid refresh token" });
        return;
      }

      // Use the Fastify instance's jwt.sign() to issue a new access token.
      const jwtInstance = (request.server as any).jwt;
      if (!jwtInstance) {
        throw new Error(
          "JWT instance is not available on the Fastify instance."
        );
      }
      const newAccessToken = jwtInstance.sign({ userId });
      reply.send({ accessToken: newAccessToken });
    } catch (err) {
      reply.code(401).send({ message: "Invalid refresh token" });
    }
  }

  async verifyOTP(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { email, otp } = request.body as { email: string; otp: string };
      const user = await authService.verifyOTP(email, otp);
      if (!user) {
        return reply.code(400).send({ message: "Invalid or expired OTP." });
      }

      const sessionId = encrypt(nanoid());
      const expiresAt = new Date(Date.now() + 86400 * 1000); // 24-hour expiration

      const ipAddress =
        request.ip || request.headers["x-forwarded-for"] || "Unknown";
      const userAgent = request.headers["user-agent"] || "Unknown";

      await Session.create({
        userId: user.id,
        sessionId,
        expiresAt,
        ipAddress,
        userAgent,
      });
      await setCache(`session:${sessionId}`, encrypt(user.id), 86400);

      reply
        .setCookie("sso_token", sessionId, {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production" ||
            request.protocol === "https", // ✅ Use Secure only when running HTTPS
          sameSite: "none",
          domain: process.env.DOMAIN || "localhost",
          path: "/",
          maxAge: 86400, // ✅ Keeps cookie after refresh (24 hours)
        })
        .send({ message: "Logged in successfully", token: sessionId });
    } catch (err: any) {
      return next(reply, new Errorhandler(err.message, 500));
    }
  }

  async getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      // Remove "Bearer " prefix to get the actual token
      const sso_token = authHeader.split(" ")[1];

      if (!sso_token)
        return reply.code(401).send({ message: "Not authenticated" });

      let userId = decrypt(await getCache(`session:${sso_token}`));

      if (!userId) {
        const session = await Session.findOne({
          sessionId: sso_token,
          isInvalidated: false,
        });
        if (!session)
          return reply.code(401).send({ message: "Session expired" });

        // ✅ Verify IP/User-Agent to prevent session hijacking
        const currentIP =
          request.ip || request.headers["x-forwarded-for"] || "Unknown";
        const currentUserAgent = request.headers["user-agent"] || "Unknown";

        if (
          session.ipAddress !== currentIP ||
          session.userAgent !== currentUserAgent
        ) {
          return reply
            .code(401)
            .send({ message: "Session hijacking detected" });
        }

        userId = session.userId;
        await setCache(`session:${sso_token}`, encrypt(userId), 86400);

        // ✅ Re-set the cookie to extend session validity
        reply.setCookie("sso_token", sso_token, {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production" ||
            request.protocol === "https", // ✅ Use Secure only when running HTTPS
          sameSite: "none",
          domain: "localhost", // Ensure consistency with frontend
          path: "/",
          maxAge: 86400, // ✅ Extends the cookie expiration
        });
      }
      const user = await User.findOne({ _id: userId });

      reply.send({ user, token: sso_token });
    } catch (err) {
      console.log("err", err);
      return reply.code(500).send({ message: "Server error" });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { sso_token } = request.cookies;
      if (!sso_token)
        return reply.code(400).send({ message: "No session found" });

      await deleteCache(`session:${sso_token}`);
      await Session.findOneAndUpdate(
        { sessionId: sso_token },
        { isInvalidated: true, loggedOutAt: new Date() }
      );

      reply
        .clearCookie("sso_token", {
          path: "/",
          domain: process.env.DOMAIN || "localhost",
        })
        .send({ message: "Logged out successfully" });
    } catch (err) {
      return reply.code(500).send({ message: "Server error" });
    }
  }
}
