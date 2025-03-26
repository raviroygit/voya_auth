import Redis from "ioredis";
import dotenv from "dotenv";
import log from "../logger";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL as string, {
  connectTimeout: 10000, // ✅ 10s timeout for Redis connection
  retryStrategy: (times) => Math.min(times * 50, 2000), // ✅ Retry backoff strategy
});

redis.on("connect", () => log.info("🟢 Connected to Upstash Redis"));
redis.on("error", (err) => log.error("❌ Redis Error:", err));

export default redis;
