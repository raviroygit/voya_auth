import Fastify from "fastify";
import log from "./utils/logger";
import { ErrorMiddleware } from "./middlewares/error";
import { connectMongoDB } from "./config/db";
import dotenv from "dotenv";
import multipart from "@fastify/multipart";
import redis from "./utils/redis/redis";
import { registerRoutes } from "./routes";
import { jwtPlugin } from "./plugins/jwt.plugin";
import cookie from "@fastify/cookie";
import { setupRateLimiter } from "./utils/rateLimiter";
import cors from "@fastify/cors";

dotenv.config(); // Load environment variables

const isDev = process.env.NODE_ENV === "development"; // ✅ Check if running in development

export const app = Fastify({
  logger: true,
  keepAliveTimeout: 300000, // ✅ 5-minute keep-alive timeout
  bodyLimit: 52428800, // ✅ 50MB body limit
  connectionTimeout: 300000, // ✅ 5-minute request timeout
});

setupRateLimiter(app);

export const fastifyInstance = app;


const allowedOrigins = [
    process.env.ORIGIN1,
    process.env.ORIGIN2
];

app.register(cors, {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow request
        } else {
            callback(new Error("Not allowed by CORS"),false); // Block request
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
});


// Register plugins
app.register(jwtPlugin);

// Optionally add an onReady hook to log the JWT instance:
app.addHook("onReady", async () => {
  const hasJwt = app.hasDecorator("jwt");
  log.info('Does app have "jwt" decorator?', hasJwt ? "yes" : "no");
});

// Register cookie support
app.register(cookie, {
  secret: process.env.COOKIE_SECRET || "", // Secure the cookies
  hook: "onRequest",
});

// ✅ Register multipart plugin globally
app.register(multipart);

// ✅ Connect to Redis for caching
app.decorate("redis", redis);

// ✅ Connect to MongoDB
connectMongoDB();

// ✅ Register routes
registerRoutes(app);

// ✅ Global error handler
app.setErrorHandler((error, request, reply) => {
  ErrorMiddleware(reply, error);
});

app.get("/", async (request, reply) => {
  log.info("Root route accessed");
  return { message: "Travel Ai Auth Server" };
});
