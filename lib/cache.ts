import { CACHE_URL } from "./constants";

import { createClient } from "redis";

let redisClient = null;

console.log(CACHE_URL);

export function getCacheClient() {
  if (redisClient === null) {
    try {
      redisClient = createClient({
        url: CACHE_URL,
      });
      redisClient.on("error", (err) => console.error("Redis client erro", err));
      redisClient.connect();
    } catch (error) {
      console.log(error);
      redisClient = null;
    }
  }
  return redisClient;
}
