import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";




export function registerRoutes(app: FastifyInstance) {
    app.register(authRoutes, { prefix: "/api/v1/auth" });
  }