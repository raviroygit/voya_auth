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
exports.deleteCache = exports.getCache = exports.setCache = void 0;
const redis_1 = __importDefault(require("./redis"));
/**
 * Cache data in Upstash Redis
 * @param key - The cache key
 * @param value - The data to store
 * @param ttl - Time-to-live in seconds (default: 1 hour)
 */
const setCache = (key_1, value_1, ...args_1) => __awaiter(void 0, [key_1, value_1, ...args_1], void 0, function* (key, value, ttl = 3600) {
    yield redis_1.default.set(key, JSON.stringify(value), "EX", ttl);
});
exports.setCache = setCache;
/**
 * Get cached data from Redis
 * @param key - The cache key
 * @returns Cached data or null
 */
const getCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield redis_1.default.get(key);
    return data ? JSON.parse(data) : null;
});
exports.getCache = getCache;
/**
 * Delete cache entry
 * @param key - The cache key to delete
 */
const deleteCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield redis_1.default.del(key);
});
exports.deleteCache = deleteCache;
