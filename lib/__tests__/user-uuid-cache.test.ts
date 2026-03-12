import {
  clearCachedUserUuids,
  clearExpiredCachedUserUuids,
  getCachedUserUuid,
} from "../user-uuid-cache";

import * as commonRequests from "../common-requests";

jest.mock("../common-requests", () => ({
  requestAuthenticatedUser: jest.fn(),
}));

const mockRequestAuthenticatedUser =
  commonRequests.requestAuthenticatedUser as jest.MockedFunction<
    typeof commonRequests.requestAuthenticatedUser
  >;

beforeEach(() => {
  clearCachedUserUuids();
  mockRequestAuthenticatedUser.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("getCachedUserUuid", () => {
  it("returns null for an empty cookie string", async () => {
    const result = await getCachedUserUuid("");
    expect(result).toBeNull();
    expect(mockRequestAuthenticatedUser).not.toHaveBeenCalled();
  });

  it("fetches the UUID on cache miss and returns it", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue({
      uuid: "user-uuid-1",
    } as any);

    const result = await getCachedUserUuid("cookie-a");
    expect(result).toBe("user-uuid-1");
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(1);
  });

  it("returns null when the data provider returns null (unauthenticated)", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue(null);

    const result = await getCachedUserUuid("cookie-unauthenticated");
    expect(result).toBeNull();
  });

  it("returns the cached UUID on a second call without re-fetching", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue({
      uuid: "user-uuid-2",
    } as any);

    await getCachedUserUuid("cookie-b");
    const result = await getCachedUserUuid("cookie-b");

    expect(result).toBe("user-uuid-2");
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(1);
  });

  it("re-fetches the UUID after the cache entry expires", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue({
      uuid: "user-uuid-3",
    } as any);

    await getCachedUserUuid("cookie-c");

    // Advance time past the 5-minute TTL.
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);

    await getCachedUserUuid("cookie-c");
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(2);
  });

  it("does not cache the UUID when the user is not authenticated", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue(null);

    await getCachedUserUuid("cookie-no-auth");
    await getCachedUserUuid("cookie-no-auth");

    // Should fetch twice because there's nothing to cache.
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(2);
  });

  it("treats different cookies as independent cache entries", async () => {
    mockRequestAuthenticatedUser
      .mockResolvedValueOnce({ uuid: "uuid-x" } as any)
      .mockResolvedValueOnce({ uuid: "uuid-y" } as any);

    const result1 = await getCachedUserUuid("cookie-x");
    const result2 = await getCachedUserUuid("cookie-y");

    expect(result1).toBe("uuid-x");
    expect(result2).toBe("uuid-y");
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(2);
  });

  it("coalesces concurrent requests for the same cookie into a single fetch", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue({
      uuid: "user-uuid-concurrent",
    } as any);

    const [r1, r2, r3] = await Promise.all([
      getCachedUserUuid("cookie-concurrent"),
      getCachedUserUuid("cookie-concurrent"),
      getCachedUserUuid("cookie-concurrent"),
    ]);

    expect(r1).toBe("user-uuid-concurrent");
    expect(r2).toBe("user-uuid-concurrent");
    expect(r3).toBe("user-uuid-concurrent");
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(1);
  });
});

describe("clearCachedUserUuids", () => {
  it("clears all cache entries so the next request re-fetches", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue({
      uuid: "user-uuid-clear",
    } as any);

    await getCachedUserUuid("cookie-clear");
    clearCachedUserUuids();
    await getCachedUserUuid("cookie-clear");

    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(2);
  });
});

describe("clearExpiredCachedUserUuids", () => {
  it("removes only expired entries, leaving valid entries intact", async () => {
    mockRequestAuthenticatedUser
      .mockResolvedValueOnce({ uuid: "uuid-stale" } as any)
      .mockResolvedValueOnce({ uuid: "uuid-fresh" } as any)
      .mockResolvedValueOnce({ uuid: "uuid-stale" } as any); // re-fetch after expiry eviction

    await getCachedUserUuid("cookie-stale");

    // Advance past TTL so the first entry expires.
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);

    await getCachedUserUuid("cookie-fresh");

    clearExpiredCachedUserUuids();

    // The fresh entry should still be cached; only one more fetch for the stale one.
    const staleResult = await getCachedUserUuid("cookie-stale");
    const freshResult = await getCachedUserUuid("cookie-fresh");

    expect(staleResult).toBe("uuid-stale");
    expect(freshResult).toBe("uuid-fresh");
    // 2 initial fetches + 1 re-fetch for the expired stale entry = 3 total.
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(3);
  });

  it("does nothing when the cache is empty", () => {
    expect(() => clearExpiredCachedUserUuids()).not.toThrow();
  });

  it("clears all entries when all are expired", async () => {
    mockRequestAuthenticatedUser.mockResolvedValue({
      uuid: "uuid-all-expired",
    } as any);

    await getCachedUserUuid("cookie-exp-1");
    await getCachedUserUuid("cookie-exp-2");

    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    clearExpiredCachedUserUuids();

    await getCachedUserUuid("cookie-exp-1");
    await getCachedUserUuid("cookie-exp-2");

    // 2 initial + 2 re-fetches after expiry cleared.
    expect(mockRequestAuthenticatedUser).toHaveBeenCalledTimes(4);
  });
});
