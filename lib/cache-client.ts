/* istanbul ignore file */

// node_modules
import { createClient, type RedisClientType } from "redis";
// lib
import { CACHE_URL } from "./constants";

/**
 * Redis client singleton.
 */
let redisClient: RedisClientType | null = null;

/**
 * Try to get the cache client, or create it if it doesn't exist. Return null if something bad
 * happens. Exported for Jest testing, but not expected to be called from outside this module.
 * @returns Redis client or null
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
      console.error(error);
      redisClient = null;
    }
  }
  return redisClient;
}
