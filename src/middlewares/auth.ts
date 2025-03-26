import { FastifyRequest, FastifyReply } from "fastify";
import { decrypt } from "../utils/encryption";
import { getCache } from "../utils/redis/cache";
import { User } from "../models/user.model";
import { Session } from "../models/session.model";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    let token = request.cookies.sso_token || null;
    const authHeader = request.headers.authorization;

    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    let userId = decrypt(await getCache(`session:${token}`));

    if (!userId) {
      const session = await Session.findOne({ sessionId: token, isInvalidated: false });
      if (!session) {
        return reply.code(401).send({ message: "Session expired" });
      }

      userId = session.userId;
    }

    const user = await User.findById(userId);
    if (!user) {
      return reply.code(401).send({ message: "User not found" });
    }

    request.user = user;
  } catch (err) {
    reply.code(500).send({ message: "Server error" });
  }
}
