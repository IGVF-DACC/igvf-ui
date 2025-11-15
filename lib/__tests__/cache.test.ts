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
  getCachedDataWithField,
  getObjectCached,
  setCachedData,
  setCachedDataWithField,
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

  describe("getCachedDataWithField", () => {
    beforeEach(() => {
      // Add hGet mock to the Redis client
      mockRedisClient.hGet = jest.fn();
    });

    it("should return cached hash field data when available", async () => {
      const testData = { id: 1, name: "test-user" };
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(testData));

      const result = await getCachedDataWithField<typeof testData>(
        "user-data",
        "user:123"
      );

      expect(result).toEqual(testData);
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(
        "user-data",
        "user:123"
      );
    });

    it("should return null when hash field doesn't exist", async () => {
      mockRedisClient.hGet.mockResolvedValue(null);

      const result = await getCachedDataWithField("user-data", "user:999");

      expect(result).toBeNull();
      expect(mockRedisClient.hGet).toHaveBeenCalledWith(
        "user-data",
        "user:999"
      );
    });

    it("should return null when Redis client is unavailable", async () => {
      mockGetCacheClient.mockResolvedValue(null);

      const result = await getCachedDataWithField("user-data", "user:123");

      expect(result).toBeNull();
      expect(mockRedisClient.hGet).not.toHaveBeenCalled();
    });

    it("should handle complex nested data in hash field", async () => {
      const complexData = {
        preferences: {
          theme: "dark",
          notifications: { email: true, sms: false },
        },
        metadata: { lastLogin: new Date().toISOString() },
      };
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(complexData));

      const result = await getCachedDataWithField<typeof complexData>(
        "settings",
        "user:456"
      );

      expect(result).toEqual(complexData);
    });

    it("should handle JSON parsing errors gracefully", async () => {
      mockRedisClient.hGet.mockResolvedValue("invalid-json{");

      const result = await getCachedDataWithField("user-data", "user:123");

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Cache hash retrieval error for key user-data, field user:123:",
        expect.any(Error)
      );
    });

    it("should handle Redis hGet errors", async () => {
      const redisError = new Error("Redis hGet failed");
      mockRedisClient.hGet.mockRejectedValue(redisError);

      const result = await getCachedDataWithField("user-data", "user:123");

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Cache hash retrieval error for key user-data, field user:123:",
        redisError
      );
    });

    it("should work with different data types in hash fields", async () => {
      // Test with string.
      const stringData = "simple string value";
      mockRedisClient.hGet.mockResolvedValueOnce(JSON.stringify(stringData));

      const stringResult = await getCachedDataWithField<string>(
        "strings",
        "field1"
      );
      expect(stringResult).toEqual(stringData);

      // Test with number.
      const numberData = 42;
      mockRedisClient.hGet.mockResolvedValueOnce(JSON.stringify(numberData));

      const numberResult = await getCachedDataWithField<number>(
        "numbers",
        "field2"
      );
      expect(numberResult).toEqual(numberData);

      // Test with boolean.
      const boolData = true;
      mockRedisClient.hGet.mockResolvedValueOnce(JSON.stringify(boolData));

      const boolResult = await getCachedDataWithField<boolean>(
        "bools",
        "field3"
      );
      expect(boolResult).toEqual(boolData);
    });

    it("should return null for empty string from Redis hash", async () => {
      mockRedisClient.hGet.mockResolvedValue("");

      const result = await getCachedDataWithField("user-data", "empty-field");

      expect(result).toBeNull();
    });
  });

  describe("setCachedDataWithField", () => {
    beforeEach(() => {
      // Add hSet and expire mocks to the Redis client.
      mockRedisClient.hSet = jest.fn();
      mockRedisClient.expire = jest.fn();
    });

    it("should set hash field data with default TTL", async () => {
      const testData = { id: 1, name: "test" };

      await setCachedDataWithField("user-data", "user:123", testData);

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "user-data",
        "user:123",
        JSON.stringify(testData)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith("user-data", 3600);
    });

    it("should set hash field data with custom TTL", async () => {
      const testData = { id: 2, name: "custom" };

      await setCachedDataWithField("settings", "user:456", testData, 7200);

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "settings",
        "user:456",
        JSON.stringify(testData)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith("settings", 7200);
    });

    it("should handle complex data structures in hash fields", async () => {
      const complexData = {
        preferences: {
          theme: "dark",
          layout: { sidebar: true, compact: false },
        },
        history: [1, 2, 3],
        timestamp: new Date().toISOString(),
      };

      await setCachedDataWithField("user-prefs", "user:789", complexData, 1800);

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "user-prefs",
        "user:789",
        JSON.stringify(complexData)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith("user-prefs", 1800);
    });

    it("should not throw when Redis is unavailable", async () => {
      mockGetCacheClient.mockResolvedValue(null);
      const testData = { id: 1 };

      await expect(
        setCachedDataWithField("user-data", "user:123", testData)
      ).resolves.not.toThrow();

      expect(mockRedisClient.hSet).not.toHaveBeenCalled();
      expect(mockRedisClient.expire).not.toHaveBeenCalled();
    });

    it("should handle Redis hSet errors gracefully", async () => {
      mockRedisClient.hSet.mockRejectedValue(new Error("Redis hSet failed"));
      const testData = { id: 1 };

      await expect(
        setCachedDataWithField("user-data", "user:123", testData)
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Cache hash set error for key user-data, field user:123:",
        expect.any(Error)
      );
    });

    it("should handle Redis expire errors gracefully", async () => {
      mockRedisClient.hSet.mockResolvedValue(1);
      mockRedisClient.expire.mockRejectedValue(
        new Error("Redis expire failed")
      );
      const testData = { id: 1 };

      await expect(
        setCachedDataWithField("user-data", "user:123", testData)
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Cache hash set error for key user-data, field user:123:",
        expect.any(Error)
      );
    });

    it("should work with different data types", async () => {
      // String
      await setCachedDataWithField("strings", "field1", "test string");
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "strings",
        "field1",
        JSON.stringify("test string")
      );

      // Number.
      await setCachedDataWithField("numbers", "field2", 123);
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "numbers",
        "field2",
        JSON.stringify(123)
      );

      // Boolean.
      await setCachedDataWithField("bools", "field3", false);
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "bools",
        "field3",
        JSON.stringify(false)
      );

      // Array.
      await setCachedDataWithField("arrays", "field4", [1, 2, 3]);
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "arrays",
        "field4",
        JSON.stringify([1, 2, 3])
      );
    });

    it("should handle null values", async () => {
      await setCachedDataWithField("nulls", "field1", null);

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "nulls",
        "field1",
        JSON.stringify(null)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith("nulls", 3600);
    });
  });

  describe("Hash Field Integration", () => {
    beforeEach(() => {
      mockRedisClient.hGet = jest.fn();
      mockRedisClient.hSet = jest.fn();
      mockRedisClient.expire = jest.fn();
    });

    it("should work end-to-end with setCachedDataWithField -> getCachedDataWithField", async () => {
      const userData = {
        id: 123,
        name: "John Doe",
        email: "john@example.com",
      };

      // Set the data.
      await setCachedDataWithField("users", "user:123", userData, 3600);

      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "users",
        "user:123",
        JSON.stringify(userData)
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith("users", 3600);

      // Mock the get to return the same data.
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(userData));

      // Get the data back
      const result = await getCachedDataWithField<typeof userData>(
        "users",
        "user:123"
      );

      expect(result).toEqual(userData);
      expect(mockRedisClient.hGet).toHaveBeenCalledWith("users", "user:123");
    });

    it("should support multiple fields under the same hash key", async () => {
      const user1 = { id: 1, name: "User 1" };
      const user2 = { id: 2, name: "User 2" };
      const user3 = { id: 3, name: "User 3" };

      // Set multiple fields
      await setCachedDataWithField("users", "user:1", user1);
      await setCachedDataWithField("users", "user:2", user2);
      await setCachedDataWithField("users", "user:3", user3);

      // Verify each field was set.
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "users",
        "user:1",
        JSON.stringify(user1)
      );
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "users",
        "user:2",
        JSON.stringify(user2)
      );
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "users",
        "user:3",
        JSON.stringify(user3)
      );

      // Verify expire was called for each (on the same hash key).
      expect(mockRedisClient.expire).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed scenarios with regular cache and hash cache", async () => {
      const regularData = { type: "regular" };
      const hashData = { type: "hash" };

      // Set regular cache data.
      await setCachedData("regular-key", regularData);

      // Set hash field data.
      await setCachedDataWithField("hash-key", "field1", hashData);

      // Verify both were called correctly.
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "regular-key",
        JSON.stringify(regularData),
        { EX: 3600 }
      );
      expect(mockRedisClient.hSet).toHaveBeenCalledWith(
        "hash-key",
        "field1",
        JSON.stringify(hashData)
      );

      // Get regular cache data.
      mockRedisClient.get.mockResolvedValue(JSON.stringify(regularData));
      const regularResult = await getCachedData("regular-key");
      expect(regularResult).toEqual(regularData);

      // Get hash field data
      mockRedisClient.hGet.mockResolvedValue(JSON.stringify(hashData));
      const hashResult = await getCachedDataWithField("hash-key", "field1");
      expect(hashResult).toEqual(hashData);
    });
  });
});
