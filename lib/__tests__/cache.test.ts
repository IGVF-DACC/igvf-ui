import { createClient } from "redis";
import FetchRequest from "../fetch-request";
import { ServerCache, retrieveCacheBackedData } from "../cache";

jest.mock("redis");

describe("ServerCache interacts with the redis API correctly", () => {
  let redisClient: ReturnType<typeof createClient>;

  beforeEach(() => {
    redisClient = createClient();
  });

  it("should call the redis get function with the proper key", async () => {
    const cache = new ServerCache("test-key");

    await cache.getData();

    expect(redisClient.get).toHaveBeenCalledWith("test-key");
  });

  it("should call the redis set function with the proper data", async () => {
    const cache = new ServerCache("test-key");

    await cache.setData({ test: "data" });

    expect(redisClient.set).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify({ test: "data" }),
      { EX: 3600 }
    );
  });

  it("should call the redis set function with a custom ttl", async () => {
    const cache = new ServerCache("test-key", 100);

    await cache.setData({ test: "data" });

    expect(redisClient.set).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify({ test: "data" }),
      { EX: 100 }
    );
  });
});

describe("ServerCache handles fetch configuration correctly", () => {
  let redisClient: ReturnType<typeof createClient>;

  beforeEach(() => {
    redisClient = createClient();
  });

  it("should fetch data if the cache is set to fetch", async () => {
    const request = new FetchRequest();
    const cache = new ServerCache("test-key");
    const fetchDataMock = jest
      .fn()
      .mockResolvedValue(JSON.stringify({ test: "data" }));
    cache.setFetchConfig(fetchDataMock, request);

    const data = await cache.getData();

    expect(data).toEqual({ test: "data" });
    expect(redisClient.get).toHaveBeenCalledWith("test-key");
    expect(redisClient.set).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify({ test: "data" }),
      { EX: 3600 }
    );
    expect(fetchDataMock).toHaveBeenCalledWith(request, null);
  });

  it("should fetch data if the cache is set to fetch and forceFetch is true", async () => {
    // Mock redisClient.get(key) to return stringified JSON for { test: "data" }
    (redisClient.get as any).mockImplementation(() => {
      return Promise.resolve(JSON.stringify({ test: "data" }));
    });

    const request = new FetchRequest();
    const cache = new ServerCache("test-key");
    const fetchDataMock = jest
      .fn()
      .mockResolvedValue(JSON.stringify({ test: "data" }));
    cache.setFetchConfig(fetchDataMock, request);

    let data = await cache.getData({ forceFetch: true });

    expect(data).toEqual({ test: "data" });
    expect(redisClient.get).not.toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify({ test: "data" }),
      { EX: 3600 }
    );
    expect(fetchDataMock).toHaveBeenCalledWith(request, null);

    // Clear the fetch config.
    cache.clearFetchConfig();
    data = await cache.getData();
    expect(redisClient.get).toHaveBeenCalledWith("test-key");
    expect(data).toEqual({ test: "data" });

    // Restore redisClient.get(key) to return null.
    (redisClient.get as any).mockImplementation(() => {
      return Promise.resolve(null);
    });
  });
});

describe("Test retrieveCacheBackedData with data on the server but not in the cache", () => {
  let redisClient: ReturnType<typeof createClient>;
  let originalWindow: any;

  beforeEach(() => {
    redisClient = createClient();

    // Mock the node fetch function to return a mock response.
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ test: "data" }),
      });
    });

    // Mock the window object to simulate a node environment.
    originalWindow = global.window;
    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(global, "window", {
      value: originalWindow,
      writable: true,
    });
  });

  it("should fetch data when we set a fetch config", async () => {
    const data = await retrieveCacheBackedData(
      "COOKIE",
      "test-key",
      "/test/path"
    );

    expect(data).toEqual({ test: "data" });
    expect(redisClient.get).toHaveBeenCalledWith("test-key");
    expect(redisClient.set).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify({ test: "data" }),
      { EX: 3600 }
    );
  });

  describe("Test retrieveCacheBackedData without data on the server or the cache", () => {
    let originalWindow: any;

    beforeEach(() => {
      redisClient = createClient();

      // Mock the node fetch function to return a mock response.
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(null),
        });
      });

      // Mock the window object to simulate a node environment.
      originalWindow = global.window;
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
      Object.defineProperty(global, "window", {
        value: originalWindow,
        writable: true,
      });
    });

    it("should fetch data when we set a fetch config", async () => {
      const data = await retrieveCacheBackedData(
        "COOKIE",
        "test-key",
        "/test/path"
      );

      expect(data).toEqual(null);
    });
  });
});
