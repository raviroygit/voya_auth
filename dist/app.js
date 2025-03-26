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
exports.fastifyInstance = exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const logger_1 = __importDefault(require("./utils/logger"));
const error_1 = require("./middlewares/error");
const db_1 = require("./config/db");
const dotenv_1 = __importDefault(require("dotenv"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const redis_1 = __importDefault(require("./utils/redis/redis"));
const routes_1 = require("./routes");
const jwt_plugin_1 = require("./plugins/jwt.plugin");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const rateLimiter_1 = require("./utils/rateLimiter");
const cors_1 = __importDefault(require("@fastify/cors"));
dotenv_1.default.config(); // Load environment variables
const isDev = process.env.NODE_ENV === "development"; // ✅ Check if running in development
exports.app = (0, fastify_1.default)({
    logger: true,
    keepAliveTimeout: 300000, // ✅ 5-minute keep-alive timeout
    bodyLimit: 52428800, // ✅ 50MB body limit
    connectionTimeout: 300000, // ✅ 5-minute request timeout
});
(0, rateLimiter_1.setupRateLimiter)(exports.app);
exports.fastifyInstance = exports.app;
const allowedOrigins = [
    process.env.ORIGIN1,
    process.env.ORIGIN2
];
exports.app.register(cors_1.default, {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow request
        }
        else {
            callback(new Error("Not allowed by CORS"), false); // Block request
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
});
// Register plugins
exports.app.register(jwt_plugin_1.jwtPlugin);
// Optionally add an onReady hook to log the JWT instance:
exports.app.addHook("onReady", () => __awaiter(void 0, void 0, void 0, function* () {
    const hasJwt = exports.app.hasDecorator("jwt");
    logger_1.default.info('Does app have "jwt" decorator?', hasJwt ? "yes" : "no");
}));
// Register cookie support
exports.app.register(cookie_1.default, {
    secret: process.env.COOKIE_SECRET || "", // Secure the cookies
    hook: "onRequest",
});
// ✅ Register multipart plugin globally
exports.app.register(multipart_1.default);
// ✅ Connect to Redis for caching
exports.app.decorate("redis", redis_1.default);
// ✅ Connect to MongoDB
(0, db_1.connectMongoDB)();
// ✅ Register routes
(0, routes_1.registerRoutes)(exports.app);
// ✅ Global error handler
exports.app.setErrorHandler((error, request, reply) => {
    (0, error_1.ErrorMiddleware)(reply, error);
});
exports.app.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Root route accessed");
    return { message: "Travel Ai Auth Server" };
}));
