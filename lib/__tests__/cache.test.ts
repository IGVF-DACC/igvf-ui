// Mock Next.js config to avoid runtime config dependencies.
jest.mock("next/config", () => () => ({
  serverRuntimeConfig: {
    CACHE_URL: "redis://localhost:6379",
  },
  publicRuntimeConfig: {
    SERVER_URL: "http://localhost:3000",
    PUBLIC_BACKEND_URL: "http://localhost:8000",
  },
}));

// Mock dependencies before imports
jest.mock("../cache-client");
jest.mock("../fetch-request");

import {
  getCachedData,
  getCachedDataFetch,
  getObjectCached,
  setCachedData,
} from "../cache";
import { getCacheClient } from "../cache-client";
import FetchRequest from "../fetch-request";

// Wrap `getCacheClient` with proper typing to access Jest mock methods.
const mockGetCacheClient = getCacheClient as jest.MockedFunction<
  typeof getCacheClient
>;
const MockFetchRequest = FetchRequest as jest.MockedClass<typeof FetchRequest>;

describe("Cache System", () => {
  let mockRedisClient: any;
  let mockFetchRequest: any;

  beforeEach(() => {
    // Create mock Redis client.
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

    // Create mock FetchRequest instance.
    mockFetchRequest = {
      getObject: jest.fn().mockReturnValue({
        optional: jest.fn(),
      }),
    };

    // Mock the getCacheClient to return our mock Redis client.
    mockGetCacheClient.mockResolvedValue(mockRedisClient);

    // Mock FetchRequest constructor.
    MockFetchRequest.mockImplementation(() => mockFetchRequest);

    // Clear console methods to avoid cluttering test output.
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("getCachedDataFetch", () => {
    describe("Cache Hit Scenarios", () => {
      it("should return cached data when available", async () => {
        const cachedData = { id: 1, name: "test" };
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

        const fetcher = jest.fn();
        const result = await getCachedDataFetch("test-key", fetcher);

        expect(result).toEqual(cachedData);
        expect(mockRedisClient.get).toHaveBeenCalledWith("test-key");
        expect(fetcher).not.toHaveBeenCalled();
        expect(mockRedisClient.set).not.toHaveBeenCalled();
      });

      it("should handle cached data with complex nested objects", async () => {
        const complexData = {
          users: [
            { id: 1, profile: { name: "John", settings: { theme: "dark" } } },
          ],
          metadata: { version: "1.0", timestamp: new Date().toISOString() },
        };
        mockRedisClient.get.mockResolvedValue(JSON.stringify(complexData));

        const fetcher = jest.fn();
        const result = await getCachedDataFetch("complex-key", fetcher);

        expect(result).toEqual(complexData);
        expect(fetcher).not.toHaveBeenCalled();
      });

      it("should fall through to fetch when cached data is corrupted", async () => {
        const fetchedData = { id: 2, name: "fresh" };
        mockRedisClient.get.mockResolvedValue("invalid-json{");
        const fetcher = jest.fn().mockResolvedValue(fetchedData);

        const result = await getCachedDataFetch("corrupted-key", fetcher);

        expect(result).toEqual(fetchedData);
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          "corrupted-key",
          JSON.stringify(fetchedData),
          { EX: 3600 }
        );
      });
    });

    describe("Cache miss scenarios", () => {
      it("should fetch and cache data when cache is empty", async () => {
        const fetchedData = { id: 1, name: "fetched" };
        mockRedisClient.get.mockResolvedValue(null);
        const fetcher = jest.fn().mockResolvedValue(fetchedData);

        const result = await getCachedDataFetch("empty-key", fetcher, 1800);

        expect(result).toEqual(fetchedData);
        expect(mockRedisClient.get).toHaveBeenCalledWith("empty-key");
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          "empty-key",
          JSON.stringify(fetchedData),
          { EX: 1800 }
        );
      });

      it("should use default TTL when none provided", async () => {
        const fetchedData = { id: 1 };
        mockRedisClient.get.mockResolvedValue(null);
        const fetcher = jest.fn().mockResolvedValue(fetchedData);

        await getCachedDataFetch("default-ttl-key", fetcher);

        expect(mockRedisClient.set).toHaveBeenCalledWith(
          "default-ttl-key",
          JSON.stringify(fetchedData),
          { EX: 3600 } // Default TTL
        );
      });

      it("should not cache null data from fetcher", async () => {
        mockRedisClient.get.mockResolvedValue(null);
        const fetcher = jest.fn().mockResolvedValue(null);

        const result = await getCachedDataFetch("null-data-key", fetcher);

        expect(result).toBeNull();
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(mockRedisClient.set).not.toHaveBeenCalled();
      });

      it("should handle fetcher errors and return null", async () => {
        mockRedisClient.get.mockResolvedValue(null);
        const fetcher = jest.fn().mockRejectedValue(new Error("Fetch failed"));

        const result = await getCachedDataFetch("error-key", fetcher);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          "Cache fetch error for key error-key:",
          expect.any(Error)
        );
        expect(mockRedisClient.set).not.toHaveBeenCalled();
      });
    });

    describe("Redis unavailable scenarios", () => {
      it("should fetch directly when Redis is unavailable", async () => {
        mockGetCacheClient.mockResolvedValue(null);
        const fetchedData = { id: 1, name: "direct" };
        const fetcher = jest.fn().mockResolvedValue(fetchedData);

        const result = await getCachedDataFetch("no-redis-key", fetcher);

        expect(result).toEqual(fetchedData);
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      it("should propagate errors when Redis unavailable and fetcher fails", async () => {
        mockGetCacheClient.mockResolvedValue(null);
        const fetcher = jest.fn().mockImplementation(async () => {
          throw new Error("Network error");
        });

        await expect(
          getCachedDataFetch("no-redis-error-key", fetcher)
        ).rejects.toThrow("Network error");
        expect(fetcher).toHaveBeenCalled();
      });
    });

    describe("Thundering herd prevention", () => {
      it("should deduplicate concurrent requests for the same key", async () => {
        const fetchedData = { id: 1, name: "concurrent" };
        mockRedisClient.get.mockResolvedValue(null);

        let resolveFirstFetch: (value: any) => void;
        let firstFetchStarted = false;

        const fetcher = jest.fn().mockImplementation(async () => {
          if (!firstFetchStarted) {
            firstFetchStarted = true;
            return new Promise((resolve) => {
              resolveFirstFetch = resolve;
            });
          }

          // This should not be called for concurrent requests.
          throw new Error("Fetcher called multiple times!");
        });

        // Start first request.
        const promise1 = getCachedDataFetch("thundering-herd-key", fetcher);

        // Wait a tiny bit to ensure the first request has started.
        await new Promise((resolve) => setTimeout(resolve, 1));

        // Start second request while first is still pending.
        const promise2 = getCachedDataFetch("thundering-herd-key", fetcher);

        // Start third request while first is still pending
        const promise3 = getCachedDataFetch("thundering-herd-key", fetcher);

        // Now resolve the first fetch
        resolveFirstFetch!(fetchedData);

        // Wait for all promises to resolve
        const results = await Promise.all([promise1, promise2, promise3]);

        // All should return the same data.
        expect(results).toEqual([fetchedData, fetchedData, fetchedData]);

        // Fetcher should only be called once.
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      it("should handle concurrent requests when first request fails", async () => {
        mockRedisClient.get.mockResolvedValue(null);

        let callCount = 0;
        const fetcher = jest.fn().mockImplementation(async () => {
          callCount += 1;
          throw new Error("Fetch failed");
        });

        // Start concurrent requests
        const results = await Promise.all([
          getCachedDataFetch("concurrent-error-test-key", fetcher),
          getCachedDataFetch("concurrent-error-test-key", fetcher),
        ]);

        expect(results).toEqual([null, null]);
        expect(callCount).toBeGreaterThan(0);
      });

      it("should allow new requests after previous request completes", async () => {
        const fetchedData1 = { id: 1, name: "first" };
        const fetchedData2 = { id: 2, name: "second" };
        mockRedisClient.get.mockResolvedValue(null);

        const fetcher1 = jest.fn().mockResolvedValue(fetchedData1);
        const fetcher2 = jest.fn().mockResolvedValue(fetchedData2);

        // First request.
        const result1 = await getCachedDataFetch("sequential-key", fetcher1);

        // Second request with different fetcher should work.
        const result2 = await getCachedDataFetch("sequential-key", fetcher2);

        expect(result1).toEqual(fetchedData1);
        expect(result2).toEqual(fetchedData2);
        expect(fetcher1).toHaveBeenCalledTimes(1);
        expect(fetcher2).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("getObjectCached", () => {
    it("should fetch and cache data using FetchRequest", async () => {
      const responseData = { id: 1, name: "api-data" };
      mockRedisClient.get.mockResolvedValue(null);
      mockFetchRequest.getObject.mockReturnValue({
        optional: jest.fn().mockReturnValue(responseData),
      });

      const result = await getObjectCached(
        "test-cookie",
        "api-key",
        "/test-path",
        7200
      );

      expect(result).toEqual(responseData);
      expect(MockFetchRequest).toHaveBeenCalledWith({ cookie: "test-cookie" });
      expect(mockFetchRequest.getObject).toHaveBeenCalledWith("/test-path");
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "api-key",
        JSON.stringify(responseData),
        { EX: 7200 }
      );
    });

    it("should use default TTL when not provided", async () => {
      const responseData = { id: 1 };
      mockRedisClient.get.mockResolvedValue(null);
      mockFetchRequest.getObject.mockReturnValue({
        optional: jest.fn().mockReturnValue(responseData),
      });

      await getObjectCached("test-cookie", "api-key", "/test-path");

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "api-key",
        JSON.stringify(responseData),
        { EX: 3600 } // Default TTL
      );
    });

    it("should handle API errors gracefully", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockFetchRequest.getObject.mockReturnValue({
        optional: jest.fn().mockReturnValue(null),
      });

      const result = await getObjectCached(
        "test-cookie",
        "error-api-key",
        "/error-path"
      );

      expect(result).toBeNull();
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    it("should return cached data when available", async () => {
      const cachedData = { id: 2, name: "cached-api-data" };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getObjectCached(
        "test-cookie",
        "cached-api-key",
        "/test-path"
      );

      expect(result).toEqual(cachedData);
      expect(mockFetchRequest.getObject).not.toHaveBeenCalled();
    });

    it("should handle empty cookie by using undefined", async () => {
      const responseData = { id: 3, name: "no-cookie-data" };
      mockRedisClient.get.mockResolvedValue(null);
      mockFetchRequest.getObject.mockReturnValue({
        optional: jest.fn().mockReturnValue(responseData),
      });

      const result = await getObjectCached(
        "",
        "no-cookie-key",
        "/no-cookie-path"
      );

      expect(result).toEqual(responseData);
      expect(MockFetchRequest).toHaveBeenCalledWith({ cookie: undefined });
      expect(mockFetchRequest.getObject).toHaveBeenCalledWith(
        "/no-cookie-path"
      );
    });
  });

  describe("setCachedData", () => {
    it("should set data in cache with default TTL", async () => {
      const testData = { id: 1, message: "hello" };

      await setCachedData("set-key", testData);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "set-key",
        JSON.stringify(testData),
        { EX: 3600 }
      );
    });

    it("should set data in cache with custom TTL", async () => {
      const testData = { id: 2, message: "world" };

      await setCachedData("custom-ttl-key", testData, 1200);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "custom-ttl-key",
        JSON.stringify(testData),
        { EX: 1200 }
      );
    });

    it("should handle complex data structures", async () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { deep: { value: "test" } },
        nullValue: null,
        booleanValue: true,
        date: new Date().toISOString(),
      };

      await setCachedData("complex-set-key", complexData);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "complex-set-key",
        JSON.stringify(complexData),
        { EX: 3600 }
      );
    });

    it("should not throw when Redis is unavailable", async () => {
      mockGetCacheClient.mockResolvedValue(null);
      const testData = { id: 1 };

      await expect(
        setCachedData("no-redis-set-key", testData)
      ).resolves.not.toThrow();
    });

    it("should handle Redis set errors gracefully", async () => {
      mockRedisClient.set.mockRejectedValue(new Error("Redis connection lost"));
      const testData = { id: 1 };

      // The function should not throw, but Redis error should propagate
      await expect(setCachedData("redis-error-key", testData)).rejects.toThrow(
        "Redis connection lost"
      );
    });
  });

  describe("getCachedData", () => {
    it("should return cached data when available", async () => {
      const testData = {
        id: 1,
        name: "test-user",
        preferences: { theme: "dark" },
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      const result = await getCachedData<typeof testData>("user-prefs:123");

      expect(result).toEqual(testData);
      expect(mockRedisClient.get).toHaveBeenCalledWith("user-prefs:123");
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    it("should return null when key doesn't exist in cache", async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await getCachedData("non-existent-key");

      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith("non-existent-key");
    });

    it("should return null when Redis client is unavailable", async () => {
      mockGetCacheClient.mockResolvedValue(null);

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it("should handle complex nested data structures", async () => {
      const complexData = {
        user: {
          id: 123,
          profile: { name: "John", settings: { notifications: true } },
        },
        metadata: { created: new Date().toISOString(), version: "1.0" },
        tags: ["important", "user-data"],
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(complexData));

      const result = await getCachedData<typeof complexData>("complex:key");

      expect(result).toEqual(complexData);
    });

    it("should handle JSON parsing errors gracefully", async () => {
      mockRedisClient.get.mockResolvedValue("invalid-json{");

      const result = await getCachedData("corrupted-key");

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Cache retrieval error for key corrupted-key:",
        expect.any(Error)
      );
    });

    it("should handle Redis get errors", async () => {
      const redisError = new Error("Redis connection lost");
      mockRedisClient.get.mockRejectedValue(redisError);

      const result = await getCachedData("error-key");

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Cache retrieval error for key error-key:",
        redisError
      );
    });

    it("should work with different data types", async () => {
      // Test with array
      const arrayData = [1, 2, 3, "test"];
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(arrayData));

      const arrayResult = await getCachedData<typeof arrayData>("array-key");
      expect(arrayResult).toEqual(arrayData);

      // Test with string
      const stringData = "simple string";
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(stringData));

      const stringResult = await getCachedData<string>("string-key");
      expect(stringResult).toEqual(stringData);

      // Test with number
      const numberData = 42;
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(numberData));

      const numberResult = await getCachedData<number>("number-key");
      expect(numberResult).toEqual(numberData);
    });

    it("should return null for empty string from Redis", async () => {
      mockRedisClient.get.mockResolvedValue("");

      const result = await getCachedData("empty-key");

      expect(result).toBeNull();
    });
  });

  describe("Integration Scenarios", () => {
    it("should work end-to-end with getCachedDataFetch -> setCachedData -> getCachedDataFetch", async () => {
      const originalData = { id: 1, name: "integration-test" };

      // First call - cache miss.
      mockRedisClient.get.mockResolvedValueOnce(null);
      const fetcher = jest.fn().mockResolvedValue(originalData);

      const result1 = await getCachedDataFetch("integration-key", fetcher);
      expect(result1).toEqual(originalData);

      // Manually set different data.
      const newData = { id: 2, name: "manual-update" };
      await setCachedData("integration-key", newData);

      // Third call - should get manually set data.
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(newData));
      const result3 = await getCachedDataFetch("integration-key", fetcher);
      expect(result3).toEqual(newData);
      expect(fetcher).toHaveBeenCalledTimes(1); // Only called once for cache miss
    });

    it("should handle mixed success and failure scenarios", async () => {
      // Successful cache set.
      await setCachedData("mixed-key-1", { success: true });

      // Failed cache operation (Redis unavailable).
      mockGetCacheClient.mockReturnValueOnce(null);
      await setCachedData("mixed-key-2", { success: false });

      // Successful cache get.
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ success: true }));
      const result = await getCachedDataFetch("mixed-key-1", jest.fn());

      expect(result).toEqual({ success: true });
      expect(mockRedisClient.set).toHaveBeenCalledTimes(1); // Only first setCachedData
    });

    it("should work end-to-end with setCachedData -> getCachedData", async () => {
      const testData = {
        userId: 123,
        preferences: { theme: "dark", language: "en" },
      };

      // Set data using setCachedData
      await setCachedData("user-prefs:123", testData, 3600);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "user-prefs:123",
        JSON.stringify(testData),
        { EX: 3600 }
      );

      // Retrieve data using getCachedData
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));
      const result = await getCachedData<typeof testData>("user-prefs:123");

      expect(result).toEqual(testData);
      expect(mockRedisClient.get).toHaveBeenCalledWith("user-prefs:123");
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle JSON.parse errors in getCachedDataFetch", async () => {
      // Redis returns malformed JSON
      mockRedisClient.get.mockResolvedValue('{"invalid": json}');
      const fetchedData = { recovered: true };
      const fetcher = jest.fn().mockResolvedValue(fetchedData);

      const result = await getCachedDataFetch("parse-error-key", fetcher);

      expect(result).toEqual(fetchedData);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("should propagate Redis get errors", async () => {
      // Mock Redis.get to return a rejected promise
      mockRedisClient.get.mockRejectedValue(new Error("Redis get failed"));
      const fetchedData = { fallback: true };
      const fetcher = jest.fn().mockResolvedValue(fetchedData);

      await expect(
        getCachedDataFetch("redis-get-error-test-key", fetcher)
      ).rejects.toThrow("Redis get failed");
    });

    it("should handle Redis set errors during caching", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.set.mockImplementation(() => {
        throw new Error("Redis set failed");
      });
      const fetchedData = { data: true };
      const fetcher = jest.fn().mockResolvedValue(fetchedData);

      const result = await getCachedDataFetch("redis-set-error-key", fetcher);

      expect(result).toBeNull(); // Should return null due to error in fetchAndCache
      expect(console.error).toHaveBeenCalledWith(
        "Cache fetch error for key redis-set-error-key:",
        expect.any(Error)
      );
    });
  });

  describe("Performance and Memory", () => {
    it("should clean up activeRequests map after completion", async () => {
      // This is more of a conceptual test since we can't easily access the internal activeRequests
      // map.
      const fetchedData = { cleanup: true };
      mockRedisClient.get.mockResolvedValue(null);
      const fetcher = jest.fn().mockResolvedValue(fetchedData);

      await getCachedDataFetch("cleanup-key", fetcher);

      // After completion, another request with the same key should call fetcher again.
      await getCachedDataFetch("cleanup-key", fetcher);

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("should handle large data objects", async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          data: `item-${i}`.repeat(100),
        })),
      };

      mockRedisClient.get.mockResolvedValue(null);
      const fetcher = jest.fn().mockResolvedValue(largeData);

      const result = await getCachedDataFetch("large-data-key", fetcher);

      expect(result).toEqual(largeData);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "large-data-key",
        JSON.stringify(largeData),
        { EX: 3600 }
      );
    });
  });
});
