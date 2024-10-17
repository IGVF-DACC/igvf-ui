import { createClient, RedisClientType } from "redis";

import { CACHE_URL } from "./constants";

// Redis client singleton.
let redisClient: RedisClientType | null = null;

/**
 * Try to get the cache client, or create it if it doesn't exist.
 * Return null if something bad happens.
 */
export function getCacheClient(): RedisClientType | null {
  if (redisClient === null) {
    try {
      redisClient = createClient({
        url: CACHE_URL,
      });
      redisClient.on("error", (err) =>
        console.error("Redis client error", err)
      );
      redisClient.connect();
    } catch (error) {
      console.log(error);
      redisClient = null;
    }
  }
  return redisClient;
}
