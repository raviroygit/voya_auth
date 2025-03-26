import redis from "./redis";

/**
 * Cache data in Upstash Redis
 * @param key - The cache key
 * @param value - The data to store
 * @param ttl - Time-to-live in seconds (default: 1 hour)
 */
export const setCache = async (key: string, value: any, ttl: number = 3600) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

/**
 * Get cached data from Redis
 * @param key - The cache key
 * @returns Cached data or null
 */
export const getCache = async (key: string) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete cache entry
 * @param key - The cache key to delete
 */
export const deleteCache = async (key: string) => {
  await redis.del(key);
};
