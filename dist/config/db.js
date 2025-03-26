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
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const encryption_1 = require("../utils/encryption");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || "";
const connectMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI, {
            maxPoolSize: 10, // ✅ Limit concurrent connections
            socketTimeoutMS: 30000, // ✅ Close inactive connections
            serverSelectionTimeoutMS: 30000, // ✅ Timeout if MongoDB is unresponsive
        });
        logger_1.default.info(`🟢 MongoDB Connected: ${MONGO_URI}`);
        yield (0, encryption_1.loadEncryptionKey)();
    }
    catch (error) {
        logger_1.default.error("❌ MongoDB Connection Error", error);
        process.exit(1); // Exit process if DB connection fails
    }
});
exports.connectMongoDB = connectMongoDB;
