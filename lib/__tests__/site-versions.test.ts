import { fetchVersions } from "../site-versions";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("fetchVersions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetch.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  function createMockResponse(data: any): Response {
    return {
      ok: true,
      json: () => Promise.resolve(data),
      status: 200,
      statusText: "OK",
    } as Response;
  }

  it("returns version info when API call succeeds", async () => {
    const mockVersionData = {
      uiVersion: "1.2.3",
      serverVersion: "4.5.6",
    };

    mockFetch.mockResolvedValueOnce(createMockResponse(mockVersionData));

    const result = await fetchVersions();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/versions/",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(result).toEqual(mockVersionData);
  });

  it("returns null when API call fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const result = await fetchVersions();

    expect(result).toBeNull();
  });

  it("returns null when fetch throws an error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchVersions();

    expect(result).toBeNull();
  });
});
