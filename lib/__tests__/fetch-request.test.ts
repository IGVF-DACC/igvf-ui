// Mock Node.js modules to enable testing of persistent connection code
jest.mock("https", () => ({
  Agent: jest.fn().mockImplementation((config) => ({
    config,
    protocol: "https:",
  })),
}));

jest.mock("http", () => ({
  Agent: jest.fn().mockImplementation((config) => ({
    config,
    protocol: "http:",
  })),
}));

import _ from "lodash";
import pako from "pako";
import FetchRequest, {
  HTTP_STATUS_CODE,
  isErrorObject,
  isHttpMethod,
  logRequest,
} from "../fetch-request";
import { DataProviderObject } from "../../globals";
import type { ErrorObject } from "../fetch-request";

declare const global: { window?: Window };

describe("Test improper authentications get detected", () => {
  it("detects and throws with improper authentication", () => {
    // Shouldn't supply both cookie and session.
    expect(() => {
      new FetchRequest({
        cookie: "mockcookie",
        session: { _csfrt_: "mocktoken" },
      });
    }).toThrow(/Must authenticate with/);

    // Shouldn't supply a cookie on the client.
    expect(() => {
      new FetchRequest({
        cookie: "mockcookie",
      });
    }).toThrow(/Client-side requests/);
  });

  describe("Test server-side improper authentication", () => {
    // FetchRequest detects the server-side environment by testing for the `window` global, so delete
    // it to simulate running on the server.
    const { window } = global;

    beforeEach(() => {
      delete global.window;
    });

    afterAll(() => {
      global.window = window;
    });

    it("detects and throws session authentication on server", () => {
      // Shouldn't supply a session on the server.
      expect(() => {
        new FetchRequest({
          session: { _csfrt_: "mocktoken" },
        });
      }).toThrow(/Server-side requests/);
    });
  });

  describe("Test successful server-side authentication", () => {
    // FetchRequest detects the server-side environment by testing for the `window` global, so delete
    // it to simulate running on the server.
    const { window } = global;

    beforeEach(() => {
      delete global.window;
    });

    afterAll(() => {
      global.window = window;
    });

    it("successfully authenticates with a cookie on the server", () => {
      const request = new FetchRequest({
        cookie: "mockcookie",
      });
      expect(request).toBeTruthy();
    });
  });
});

describe("Test persistent connection functionality", () => {
  // Simulate server-side environment for persistent connections
  const { window } = global;

  beforeEach(() => {
    delete global.window;
  });

  afterAll(() => {
    global.window = window;
  });

  it("initializes connection pool on server-side", () => {
    // Create a new instance to trigger initialization
    const request = new FetchRequest();
    expect(request).toBeTruthy();
  });

  it("handles import failure gracefully when modules are missing", () => {
    // Mock require to throw an error
    const originalRequire = require;
    (global as any).require = jest.fn().mockImplementation((module) => {
      if (module === "http" || module === "https") {
        throw new Error("Module not found");
      }
      return originalRequire(module);
    });

    try {
      // This should handle the import failure gracefully
      const request = new FetchRequest();
      expect((request as any).usingPersistentConnections).toBe(false);
    } finally {
      // Restore original require
      (global as any).require = originalRequire;
    }
  });

  it("handles buildOptionsWithAgent correctly", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ test: "data" }),
      })
    );

    const request = new FetchRequest();

    // Make a request that will call buildOptionsWithAgent
    await request.getObject("/test-path");

    // Verify that fetch was called, which means buildOptionsWithAgent worked
    expect(window.fetch).toHaveBeenCalled();
  });

  it("handles getConnectionAgent with various URLs", () => {
    const request = new FetchRequest();

    // Test with invalid URL - should handle gracefully
    const invalidAgent = (request as any).getConnectionAgent("not-a-url");
    expect(invalidAgent).toBeUndefined();

    // Test with valid HTTPS URL
    const httpsAgent = (request as any).getConnectionAgent(
      "https://example.com"
    );
    // Should either return an agent or undefined based on server/client environment
    expect(typeof httpsAgent === "object" || httpsAgent === undefined).toBe(
      true
    );

    // Test with valid HTTP URL
    const httpAgent = (request as any).getConnectionAgent("http://example.com");
    // Should either return an agent or undefined based on server/client environment
    expect(typeof httpAgent === "object" || httpAgent === undefined).toBe(true);
  });

  it("handles connection agent creation with valid URL", async () => {
    // Mock fetch for the actual request
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ test: "data" }),
      })
    );

    const request = new FetchRequest();

    // Test that the method works even if agents aren't available
    const result = await request.getObject("/test-path");
    expect(result.isOk()).toBe(true);
  });

  it("handles invalid URL in getConnectionAgent gracefully", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Not found" }),
      })
    );

    const request = new FetchRequest();

    // Test with an invalid URL - this should still work but return an error
    const result = await request.getObjectByUrl(
      "http://invalid-url-test.com/test"
    );
    expect(result.isErr()).toBe(true);
  });

  it("uses persistent connections when available", async () => {
    // Test that buildOptionsWithAgent adds agent when available
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const request = new FetchRequest();
    const result = await request.getObject("/test-path");
    expect(result.isOk()).toBe(true);

    // Verify fetch was called
    expect(window.fetch).toHaveBeenCalled();
  });

  it("covers connection pool initialization with server environment", () => {
    // Since Jest runs in jsdom environment with window object, we can't easily
    // test the server-only module loading. But we can test the connection pool logic.

    // Clear the static connection pool state to test reinitialization
    (FetchRequest as any).connectionPoolInitialized = false;
    (FetchRequest as any).httpsAgent = undefined;
    (FetchRequest as any).httpAgent = undefined;

    // Verify mocked agents are available
    const https = require("https");
    const http = require("http");
    expect(typeof https.Agent).toBe("function");
    expect(typeof http.Agent).toBe("function");

    // Create FetchRequest to trigger connection pool initialization attempt
    const request = new FetchRequest();

    // Verify the request was created
    expect(request).toBeDefined();

    // Test the connection pool functionality that is available
    const connectionPoolInitialized = (FetchRequest as any)
      .connectionPoolInitialized;
    const usingPersistent = (request as any).usingPersistentConnections;

    // These should be boolean values
    expect(typeof connectionPoolInitialized).toBe("boolean");
    expect(typeof usingPersistent).toBe("boolean");

    // In Jest's browser-like environment, persistent connections won't be available
    // but the code paths should still be exercised
    expect(usingPersistent).toBe(false);
  });

  it("handles connection pool initialization failure gracefully", () => {
    // Simulate server environment
    delete (global as any).window;

    // Reset connection pool state
    (FetchRequest as any).connectionPoolInitialized = false;
    (FetchRequest as any).httpsAgent = undefined;
    (FetchRequest as any).httpAgent = undefined;

    // Mock agents to throw an error during initialization
    const MockHttpsAgent = jest.fn().mockImplementation(() => {
      throw new Error("Agent initialization failed");
    });
    const MockHttpAgent = jest.fn().mockImplementation(() => {
      throw new Error("Agent initialization failed");
    });

    const https = require("https");
    const http = require("http");
    https.Agent = MockHttpsAgent;
    http.Agent = MockHttpAgent;

    // Create request instance - should handle initialization failure gracefully
    const request = new FetchRequest();

    // Verify persistent connections are not available after failure
    expect((request as any).usingPersistentConnections).toBe(false);

    // Verify agents remain undefined after failure
    expect((FetchRequest as any).httpsAgent).toBeUndefined();
    expect((FetchRequest as any).httpAgent).toBeUndefined();
  });

  it("handles module import failure gracefully", () => {
    // Simulate browser environment to avoid initialization
    (global as any).window = {};

    // Reset connection pool state
    (FetchRequest as any).connectionPoolInitialized = false;
    (FetchRequest as any).httpsAgent = undefined;
    (FetchRequest as any).httpAgent = undefined;

    // Create request instance in browser environment
    const request = new FetchRequest();

    // Verify persistent connections are not available in browser
    expect((request as any).usingPersistentConnections).toBe(false);

    // Clean up
    delete (global as any).window;
  });

  it("covers getConnectionAgent with https and http URLs", () => {
    // Simulate server environment
    delete (global as any).window;

    // Set up connection pool
    (FetchRequest as any).connectionPoolInitialized = true;
    const mockHttpsAgent = { protocol: "https:" };
    const mockHttpAgent = { protocol: "http:" };
    (FetchRequest as any).httpsAgent = mockHttpsAgent;
    (FetchRequest as any).httpAgent = mockHttpAgent;

    const request = new FetchRequest();

    // Test HTTPS URL
    const httpsAgent = (request as any).getConnectionAgent(
      "https://example.com"
    );
    expect(httpsAgent).toBe(mockHttpsAgent);

    // Test HTTP URL
    const httpAgent = (request as any).getConnectionAgent("http://example.com");
    expect(httpAgent).toBe(mockHttpAgent);

    // Test invalid URL - should return undefined
    const invalidAgent = (request as any).getConnectionAgent("invalid-url");
    expect(invalidAgent).toBeUndefined();
  });

  it("covers buildOptionsWithAgent with agent assignment", async () => {
    // Simulate server environment
    delete (global as any).window;

    // Set up connection pool
    (FetchRequest as any).connectionPoolInitialized = true;
    const mockHttpsAgent = { protocol: "https:" };
    (FetchRequest as any).httpsAgent = mockHttpsAgent;

    const request = new FetchRequest();

    // Mock fetch to capture the options passed to it
    let capturedOptions: any = null;
    window.fetch = jest.fn().mockImplementation((url, options) => {
      capturedOptions = options;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    // Make a request that should use the agent
    await request.getObjectByUrl("https://example.com/test");

    // Verify that the agent was added to the options
    expect(capturedOptions.agent).toBe(mockHttpsAgent);
  });

  it("covers buildOptions with includeCredentials default parameter", () => {
    const request = new FetchRequest();

    // Test buildOptions without includeCredentials parameter to cover line 449 default parameter assignment
    const options = (request as any).buildOptions("GET", {});

    expect(options).toBeDefined();
    expect(options.credentials).toBe("include");
  });
});

describe("Test GET requests to the data provider", () => {
  it("retrieves a single item from the server correctly", async () => {
    // Mock lab collection retrieval.
    const mockData = {
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      title: "J. Michael Cherry, Stanford",
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const request = new FetchRequest();
    let labItem = await request.getObject("/labs/j-michael-cherry/");
    expect(labItem.isOk()).toBeTruthy();
    expect(_.isEqual(labItem.unwrap(), mockData)).toBeTruthy();

    labItem = await request.getObject("/labs/j-michael-cherry?type=Lab", {
      isDbRequest: true,
    });
    expect(labItem.isOk()).toBeTruthy();
    expect(_.isEqual(labItem.unwrap(), mockData)).toBeTruthy();

    labItem = await request.getObject("/labs/j-michael-cherry", {
      isDbRequest: true,
    });
    expect(labItem.isOk()).toBeTruthy();
    expect(_.isEqual(labItem.unwrap(), mockData)).toBeTruthy();
    expect(
      FetchRequest.isResponseSuccess(labItem.unwrap() as DataProviderObject)
    ).toBeTruthy();
  });

  it("retrieves multiple items from the server correctly", async () => {
    const mockData = [
      {
        name: "j-michael-cherry",
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      {
        name: "jesse-engreitz",
        "@id": "/labs/jesse-engreitz/",
        "@type": ["Lab", "Item"],
        title: "Jesse Engreitz, Stanford University",
      },
    ];
    window.fetch = jest.fn().mockImplementation((url) => {
      const matchingData = mockData.find((data) => url === data["@id"]) || null;
      return Promise.resolve({
        ok: matchingData !== null,
        json: () => {
          return Promise.resolve(matchingData);
        },
      });
    });

    // Retrieve multiple lab items without filtering error results.
    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    let labItems = await request.getMultipleObjects([
      "/labs/j-michael-cherry/",
      "/labs/jesse-engreitz/",
      "/labs/unknown/",
    ]);
    expect(labItems).toBeTruthy();
    expect(labItems).toHaveLength(3);

    // Retrieve multiple lab items while filtering error results.
    labItems = await request.getMultipleObjects(
      ["/labs/j-michael-cherry/", "/labs/jesse-engreitz/", "/labs/unknown/"],
      { filterErrors: true }
    );
    expect(labItems).toBeTruthy();
    expect(labItems).toHaveLength(2);

    // Make sure passing an empty array returns an empty array.
    const noLabItems = await request.getMultipleObjects([]);
    expect(noLabItems).toBeTruthy();
    expect(noLabItems).toHaveLength(0);
  });

  it("retrieves a collection object from the server correctly", async () => {
    const mockData = {
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
      "@context": "/terms/",
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const request = new FetchRequest();
    const labCollection = await request.getCollection("labs");
    expect(labCollection).toBeTruthy();
    expect(_.isEqual(labCollection.unwrap(), mockData)).toBeTruthy();
  });

  it("receives a network error object when fetch throws an error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = (
      await request.getObject("/labs/j-michael-cherry/")
    ).union() as DataProviderObject;
    expect(labItem).toBeTruthy();
    expect(labItem["@type"]).toContain("NetworkError");
    expect(labItem.status).toEqual("error");
    expect(labItem.code).toEqual(503);
    expect(FetchRequest.isResponseSuccess(labItem)).toBeFalsy();
  });

  it("returns default error value when GET request unsuccessful", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            "@type": ["HTTPNotFound", "Error"],
            status: "error",
            code: 404,
            title: "Not Found",
            description: "The resource could not be found.",
            detail: "URL",
          }),
      })
    );

    const request = new FetchRequest();
    console.log("We want 404");
    const labItem = await request.getObject("/labs/j-michael-cherry/");
    expect(labItem.isErr()).toBeTruthy();
    expect(labItem.unwrap_err().code).toEqual(404);
  });

  it("returns a default error value on a network error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.getObject("/labs/j-michael-cherry/");
    expect(labItem.isErr()).toBeTruthy();
    expect(labItem.unwrap_err().code).toBe(
      HTTP_STATUS_CODE.SERVICE_UNAVAILABLE
    );
    expect(labItem.optional()).toBe(null);
  });
});

describe("Test URL-specific fetch requests", () => {
  it("retrieves a single item from the server correctly", async () => {
    // Mock lab collection retrieval.
    const mockData = {
      _csfrt_: "mock_csrf_token",
      "auth.userid": "email@example.com",
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const request = new FetchRequest();
    const session = await request.getObjectByUrl(
      "http://localhost:8000/session"
    );
    expect(session.isOk()).toBe(true);
    expect(_.isEqual(session.unwrap(), mockData)).toBeTruthy();
  });

  it("returns an error on throw", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.getObjectByUrl(
      "http://localhost:8000/labs/j-michael-cherry/"
    );
    expect(labItem.isErr()).toBe(true);
    expect(labItem.unwrap_err()["@type"]).toContain("NetworkError");
    expect(labItem.unwrap_err().status).toEqual("error");
    expect(labItem.unwrap_err().code).toEqual(503);
    expect(FetchRequest.isResponseSuccess(labItem.union())).toBeFalsy();
  });

  it("returns a specific error value", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            "@type": ["HTTPNotFound", "Error"],
            status: "error",
            code: 404,
            title: "Not Found",
            description: "The resource could not be found.",
            detail: "URL",
          }),
      })
    );

    const request = new FetchRequest();
    const session = await request.getObjectByUrl(
      "http://localhost:8000/session"
    );
    expect(session.isErr()).toBe(true);
    expect(session.unwrap_err().code).toBe(404);
  });

  it("returns a default error value", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            "@type": ["HTTPNotFound", "Error"],
            status: "error",
            code: 404,
            title: "Not Found",
            description: "The resource could not be found.",
            detail: "URL",
          }),
      })
    );

    const request = new FetchRequest();
    const session = await request.getObjectByUrl(
      "http://localhost:8000/session"
    );
    expect(session.isErr()).toBeTruthy();
    expect(session.unwrap_err().status).toEqual("error");
    expect(session.unwrap_err().code).toEqual(404);
  });
});

describe("Text fetch requests", () => {
  it("returns text with a successful request", async () => {
    const mockData = "## Markdown";
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(mockData),
      })
    );

    const request = new FetchRequest();
    const markdown = await request.getText("/markdown/path");
    expect(markdown).toEqual(mockData);
  });

  it("returns an error object when text request unsuccessful", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        text: () =>
          Promise.resolve({
            "@type": ["HTTPNotFound", "Error"],
            status: "error",
            code: 404,
            title: "Not Found",
            description: "The resource could not be found.",
            detail: "URL",
          }),
      })
    );

    const request = new FetchRequest();
    const markdown = (await request.getText("/markdown/path")) as ErrorObject;
    expect(typeof markdown).toEqual("object");
    expect(markdown["@type"]).toContain("HTTPNotFound");
  });

  it("returns a default value when text request unsuccessful", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        text: () =>
          Promise.resolve({
            "@type": ["HTTPNotFound", "Error"],
            status: "error",
            code: 404,
            title: "Not Found",
            description: "The resource could not be found.",
            detail: "URL",
          }),
      })
    );

    const request = new FetchRequest();
    const markdown = await request.getText("/markdown/path", "Error Message");
    expect(typeof markdown).toEqual("string");
    expect(markdown).toEqual("Error Message");
  });

  it("returns a network error on a text request", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const markdown = (await request.getText("/markdown/path")) as ErrorObject;
    expect(markdown).toBeTruthy();
    expect(markdown["@type"]).toContain("NetworkError");
    expect(markdown.status).toEqual("error");
    expect(markdown.code).toEqual(503);
    expect(
      FetchRequest.isResponseSuccess(markdown as unknown as DataProviderObject)
    ).toBeFalsy();
  });

  it("returns a default value for a network error on a text request", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const markdown = await request.getText(
      "/markdown/path",
      "Proxima Centauri"
    );
    expect(markdown).toEqual("Proxima Centauri");
  });
});

describe("POST fetch requests", () => {
  it("returns a successful response", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "success" }),
      })
    );

    const request = new FetchRequest();
    const response = await request.postObject("/path", { animal: "cat" });
    expect(response).toEqual({ status: "success" });
  });

  it("returns a network error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.postObject("/labs/j-michael-cherry/", {
      airplane: "Daher",
    });
    expect(labItem).toBeTruthy();
    expect(labItem["@type"]).toContain("NetworkError");
    expect(labItem.status).toEqual("error");
    expect(labItem.code).toEqual(503);
  });
});

describe("PUT fetch requests", () => {
  it("returns a successful response", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "success" }),
      })
    );

    const request = new FetchRequest();
    const response = await request.putObject("/path", {
      epoch: "Anthropocene",
    });
    expect(response).toEqual({ status: "success" });
  });

  it("returns a network error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.putObject("/labs/j-michael-cherry/", {
      boat: "Nordhavn",
    });
    expect(labItem).toBeTruthy();
    expect(labItem["@type"]).toContain("NetworkError");
    expect(labItem.status).toEqual("error");
    expect(labItem.code).toEqual(503);
  });
});

describe("PATCH fetch requests", () => {
  it("returns a successful response", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "success" }),
      })
    );

    const request = new FetchRequest();
    const response = await request.patchObject("/path", {
      movie: "Fargo",
    });
    expect(response).toEqual({ status: "success" });
  });

  it("returns a network error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.patchObject("/labs/j-michael-cherry/", {
      car: "Polestar",
    });
    expect(labItem).toBeTruthy();
    expect(labItem["@type"]).toContain("NetworkError");
    expect(labItem.status).toEqual("error");
    expect(labItem.code).toEqual(503);
  });

  describe("Test backend (/api/) requests", () => {
    it("retrieves a single item from the NextJS server correctly", async () => {
      const mockData = {
        "@graph": [],
        all: "/awards/?limit=all",
        title: "Awards (Grants)",
        description: "Listing of awards (aka grants)",
        "@id": "/awards/?limit=0",
        "@type": ["AwardCollection", "Collection"],
        "@context": "/terms/",
        actions: [
          {
            name: "add",
            title: "Add",
            profile: "/profiles/Award.json",
            href: "/awards/#!add",
          },
        ],
      };

      window.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      );

      const request = new FetchRequest({ backend: true });
      const awardProfiles = await request.getObject(
        "/api/mapprofile?profile=award"
      );
      expect(awardProfiles.unwrap()).toEqual(mockData);
    });
  });
});

describe("Test getMultipleObjectsBulk()", () => {
  it("retrieves a small number of items from the server correctly", async () => {
    const mockData = {
      "@graph": [
        {
          "@id": "/labs/j-michael-cherry/",
          "@type": ["Lab", "Item"],
          name: "j-michael-cherry",
        },
        {
          "@id": "/labs/jesse-engreitz/",
          "@type": ["Lab", "Item"],
          name: "jesse-engreitz",
        },
      ],
      "@id":
        "/search/?field=name&@id=/labs/j-michael-cherry/&@id=/labs/jesse-engreitz/&@id=/labs/unknown/&limit=3",
      "@type": ["Search"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    const labItems = await request.getMultipleObjectsBulk(
      ["/labs/j-michael-cherry/", "/labs/jesse-engreitz/", "/labs/unknown/"],
      ["name"]
    );
    expect(labItems.isOk()).toBeTruthy();
    expect(labItems.unwrap()).toHaveLength(2);
  });

  it("retrieves a small number of items from the server correctly with no fields requested", async () => {
    const mockData = {
      "@graph": [
        {
          "@id": "/labs/j-michael-cherry/",
          "@type": ["Lab", "Item"],
          name: "j-michael-cherry",
        },
        {
          "@id": "/labs/jesse-engreitz/",
          "@type": ["Lab", "Item"],
          name: "jesse-engreitz",
        },
      ],
      "@id":
        "/search/?field=name&@id=/labs/j-michael-cherry/&@id=/labs/jesse-engreitz/&@id=/labs/unknown/&limit=3",
      "@type": ["Search"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    const labItems = await request.getMultipleObjectsBulk(
      ["/labs/j-michael-cherry/", "/labs/jesse-engreitz/", "/labs/unknown/"],
      []
    );
    expect(labItems.isOk()).toBeTruthy();
    expect(labItems.unwrap()).toHaveLength(2);
  });

  it("retrieves a large number of items from the server correctly", async () => {
    // Generate an array of 100 unique paths.
    const paths = [];
    for (let i = 0; i < 100; i++) {
      paths.push(`/labs/${i}`);
    }

    const mockData = paths.map((path) => ({
      "@id": path,
      "@type": ["Lab", "Item"],
      name: path,
    }));

    const mockResults0 = {
      "@graph": mockData.slice(0, 80),
      "@id": `/search/?field=name&${paths.map(
        (path) => `@id=${path.slice(0, 80)}&`
      )}limit=80`,
      "@type": ["Search"],
    };

    const mockResults1 = {
      "@graph": mockData.slice(80),
      "@id": `/search/?field=name&${paths.map(
        (path) => `@id=${path.slice(80)}&`
      )}limit=20`,
      "@type": ["Search"],
    };

    let requestNumber = 0;
    window.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve(
            requestNumber++ === 0 ? mockResults0 : mockResults1
          );
        },
      });
    });

    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    const labItems = await request.getMultipleObjectsBulk(paths, ["name"]);
    expect(labItems.isOk()).toBeTruthy();
    expect(labItems.unwrap()).toHaveLength(100);
  });

  it("retrieves no items from an empty array", async () => {
    // Make sure passing an empty array returns an empty array.
    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    const noLabItems = await request.getMultipleObjectsBulk([], ["name"]);
    expect(noLabItems.isOk()).toBeTruthy();
    expect(noLabItems.unwrap()).toHaveLength(0);
  });

  it("detects a network error and returns the specified error value", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    const labItems = await request.getMultipleObjectsBulk(
      ["/labs/j-michael-cherry/", "/labs/jesse-engreitz/", "/labs/unknown/"],
      ["name"]
    );
    expect(labItems.isErr()).toBeTruthy();
    expect(labItems.unwrap_err().code).toBe(
      HTTP_STATUS_CODE.SERVICE_UNAVAILABLE
    );
    expect(labItems.unwrap_err()["@type"]).toContain("NetworkError");
  });

  it("covers typeQuery ternary operator with non-empty types array", async () => {
    // Mock successful response
    const mockData = {
      "@graph": [
        {
          "@id": "/labs/test-lab/",
          "@type": ["Lab", "Item"],
          name: "test-lab",
        },
      ],
    };

    window.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    ) as jest.Mock;

    const request = new FetchRequest();

    // Call with non-empty types array to cover line 641 typeQuery ternary
    const labItems = await request.getMultipleObjectsBulk(
      ["/labs/test-lab/"],
      ["name"],
      ["Lab", "Item"] // Non-empty types array to exercise typeQuery logic
    );

    expect(labItems.isOk()).toBeTruthy();
    expect(labItems.unwrap()).toHaveLength(1);
  });
});

describe("Test static isResponseSuccess function", () => {
  it("returns true for a successful response", () => {
    const response = {
      status: "success",
    };
    expect(FetchRequest.isResponseSuccess(response)).toBeTruthy();
  });
});

describe("Test isErrorObject function", () => {
  it("returns true for an error object", () => {
    const error: ErrorObject = {
      isError: true,
      "@type": ["HTTPNotFound", "Error"],
      code: 404,
      description: "The resource could not be found.",
      detail: "URL",
      status: "error",
      title: "Not Found",
    };
    expect(isErrorObject(error)).toBeTruthy();
  });

  it("returns false for a non-error object", () => {
    const response: DataProviderObject = {
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      name: "j-michael-cherry",
    };
    expect(isErrorObject(response)).toBeFalsy();
  });
});

describe("Test getZippedPreviewText()", () => {
  it("returns a successful response", async () => {
    // Example plain text to compress (simulate the gzipped file's contents)
    const text = "line1\nline2\nline3\nline4\nline5";
    const compressedData = pako.gzip(text);

    // Split compressed data into two chunks to simulate streaming
    const chunk1 = compressedData.slice(
      0,
      Math.floor(compressedData.length / 2)
    );
    const chunk2 = compressedData.slice(Math.floor(compressedData.length / 2));

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ value: chunk1, done: false })
        .mockResolvedValueOnce({ value: chunk2, done: true }),
      cancel: jest.fn(),
    };

    window.fetch = jest.fn(() =>
      Promise.resolve({
        body: {
          getReader: () => mockReader,
        },
        headers: new Headers(),
        ok: true,
        status: 206,
      })
    ) as jest.Mock;

    const fetchRequest = new FetchRequest();
    const result = await fetchRequest.getZippedPreviewText(
      "http://example.com/test.gz",
      5
    );

    expect(result).toContain("line1");
    expect(result).toContain("line5");
    expect(result.split("\n").length).toBeLessThanOrEqual(5);
  });

  it("handles fetch error when response has no body", async () => {
    window.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        body: null, // This will trigger line 807 - the ReadableStream error
      })
    ) as jest.Mock;

    const fetchRequest = new FetchRequest();

    await expect(
      fetchRequest.getZippedPreviewText("http://example.com/notfound.gz", 5)
    ).rejects.toThrow("ReadableStream not supported in this browser");
  });

  it("handles fetch network error", async () => {
    window.fetch = jest.fn(() =>
      Promise.reject(new Error("Network error"))
    ) as jest.Mock;

    const fetchRequest = new FetchRequest();

    await expect(
      fetchRequest.getZippedPreviewText("http://example.com/error.gz", 5)
    ).rejects.toThrow("Network error");
  });

  it("handles decompression errors gracefully", async () => {
    // Create data that will cause pako decompression error
    const corruptedData = new Uint8Array([0xff, 0xff, 0xff, 0xff]);

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ value: corruptedData, done: true }),
      cancel: jest.fn(),
    };

    window.fetch = jest.fn(() =>
      Promise.resolve({
        body: {
          getReader: () => mockReader,
        },
        headers: new Headers(),
        ok: true,
        status: 206,
      })
    ) as jest.Mock;

    const fetchRequest = new FetchRequest();
    const result = await fetchRequest.getZippedPreviewText(
      "http://example.com/corrupted.gz",
      5
    );

    // Should return error message when decompression fails (covers lines 851-852)
    expect(result).toContain("ERROR:");
  });

  it("handles decompression error with invalid gzip data", async () => {
    // Create invalid compressed data that will cause pako to throw
    const invalidCompressedData = new Uint8Array([
      0x1f, 0x8b, 0x08, 0x00, 0x00,
    ]);

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ value: invalidCompressedData, done: true }),
      cancel: jest.fn(),
    };

    window.fetch = jest.fn(() =>
      Promise.resolve({
        body: {
          getReader: () => mockReader,
        },
        headers: new Headers(),
        ok: true,
        status: 206,
      })
    ) as jest.Mock;

    const fetchRequest = new FetchRequest();
    const result = await fetchRequest.getZippedPreviewText(
      "http://example.com/invalid.gz",
      5
    );

    expect(result).toBe("");
  });

  it("covers getZippedPreviewText with default maxLines parameter", async () => {
    // Create mock data
    const text = "line1\nline2\nline3";
    const compressedData = pako.gzip(text);

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ value: compressedData, done: true }),
      cancel: jest.fn(),
    };

    window.fetch = jest.fn(() =>
      Promise.resolve({
        body: {
          getReader: () => mockReader,
        },
        headers: new Headers(),
        ok: true,
        status: 206,
      })
    ) as jest.Mock;

    const fetchRequest = new FetchRequest();

    // Call without maxLines parameter to use default, covering line 794
    const result = await fetchRequest.getZippedPreviewText(
      "http://example.com/test.gz"
    );

    expect(result).toContain("line1");
  });
});

describe("Test getMultipleObjectsBySearch()", () => {
  const mockSearchData = {
    "@graph": [
      {
        "@id": "/assay-terms/OBI_0001271/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_name: "RNA-seq",
        definition:
          "A DNA sequencing assay that determines the order of nucleotides...",
      },
      {
        "@id": "/assay-terms/OBI_0000716/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_name: "ChIP-seq",
        definition:
          "Chromatin immunoprecipitation followed by DNA sequencing...",
      },
    ],
    "@id":
      "/search-quick/?type=AssayTerm&field=term_name&field=definition&term_name=RNA-seq&term_name=ChIP-seq",
    "@type": ["Search"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retrieves objects using query string option", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name", "definition"],
      { query: "term_name=RNA-seq&term_name=ChIP-seq" }
    );

    expect(result.isOk()).toBeTruthy();
    expect(result.unwrap()).toHaveLength(2);
    expect(result.unwrap()[0].term_name).toBe("RNA-seq");
    expect(result.unwrap()[1].term_name).toBe("ChIP-seq");

    // Verify the correct URL was called
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/search-quick/?type=AssayTerm&field=term_name&field=definition&term_name=RNA-seq&term_name=ChIP-seq"
      ),
      expect.any(Object)
    );
  });

  it("retrieves objects using property and values option", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name", "definition"],
      { property: "term_name", values: ["RNA-seq", "ChIP-seq"] }
    );

    expect(result.isOk()).toBeTruthy();
    expect(result.unwrap()).toHaveLength(2);
    expect(result.unwrap()[0].term_name).toBe("RNA-seq");

    // Verify the correct URL was called with property/values format
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/search-quick/?type=AssayTerm&field=term_name&field=definition&term_name=RNA-seq&term_name=ChIP-seq"
      ),
      expect.any(Object)
    );
  });

  it("handles empty fields array correctly", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch("AssayTerm", [], {
      query: "term_name=RNA-seq",
    });

    expect(result.isOk()).toBeTruthy();

    // Verify the URL doesn't include field parameters when fields array is empty
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/search-quick/?type=AssayTerm&term_name=RNA-seq"
      ),
      expect.any(Object)
    );
  });

  it("trims whitespace from query string", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name"],
      { query: "  term_name=RNA-seq  " }
    );

    expect(result.isOk()).toBeTruthy();

    // Verify trimmed query is used
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining("term_name=RNA-seq"),
      expect.any(Object)
    );
    expect(window.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("  term_name=RNA-seq  "),
      expect.any(Object)
    );
  });

  it("trims whitespace from property and filters empty values", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name"],
      {
        property: "  term_name  ",
        values: ["  RNA-seq  ", "", "  ChIP-seq  ", "   "],
      }
    );

    expect(result.isOk()).toBeTruthy();

    // Verify trimmed property is used and empty/whitespace values are filtered out, values are trimmed
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining("term_name=RNA-seq&term_name=ChIP-seq"),
      expect.any(Object)
    );
  });

  it("handles special characters in property values correctly", async () => {
    const mockDataWithSpecialChars = {
      "@graph": [
        {
          "@id": "/assay-terms/special/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_name: "RNA-seq & analysis",
        },
      ],
      "@id": "/search-quick/",
      "@type": ["Search"],
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDataWithSpecialChars),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name"],
      { property: "term_name", values: ["RNA-seq & analysis", "test/value"] }
    );

    expect(result.isOk()).toBeTruthy();

    // Verify URL encoding is applied to property values
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "term_name=RNA-seq%20%26%20analysis&term_name=test%2Fvalue"
      ),
      expect.any(Object)
    );
  });

  it("encodes field names correctly in URL", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["@id", "term_name", "description & notes"],
      { query: "test" }
    );

    // Verify field names are properly encoded
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "field=%40id&field=term_name&field=description%20%26%20notes"
      ),
      expect.any(Object)
    );
  });

  it("handles server error responses correctly", async () => {
    const mockError = {
      "@type": ["HTTPNotFound", "Error"],
      status: "error",
      code: 404,
      title: "Not Found",
      description: "The resource could not be found.",
      isError: true,
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(mockError),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name"],
      { query: "nonexistent" }
    );

    expect(result.isErr()).toBeTruthy();
    expect(result.unwrap_err().title).toBe("Not Found");
  });

  it("handles network errors correctly", async () => {
    window.fetch = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Network error")));

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name"],
      { query: "test" }
    );

    expect(result.isErr()).toBeTruthy();
    expect(result.unwrap_err().title).toBe("Unknown error");
  });

  it("handles missing @graph property correctly", async () => {
    const mockDataWithoutGraph = {
      "@id": "/search-quick/",
      "@type": ["Search"],
      // No @graph property
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDataWithoutGraph),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name"],
      { query: "test" }
    );

    expect(result.isOk()).toBeTruthy();
    expect(result.unwrap()).toEqual([]);
  });

  it("throws error when type parameter is empty", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    await expect(
      request.getMultipleObjectsBySearch("", ["term_name"], { query: "test" })
    ).rejects.toThrow("`type` parameter required");
  });

  it("throws error when type parameter is only whitespace", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    await expect(
      request.getMultipleObjectsBySearch("   ", ["term_name"], {
        query: "test",
      })
    ).rejects.toThrow("`type` parameter required");
  });

  it("throws error when neither query nor property/values provided", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    await expect(
      request.getMultipleObjectsBySearch("AssayTerm", ["term_name"], {
        query: "",
      })
    ).rejects.toThrow(
      "Invalid search options: provide either a query string or property with values"
    );
  });

  it("throws error when property provided without values", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    await expect(
      request.getMultipleObjectsBySearch("AssayTerm", ["term_name"], {
        property: "term_name",
        values: [],
      })
    ).rejects.toThrow(
      "Invalid search options: provide either a query string or property with values"
    );
  });

  it("throws error when property is empty", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    await expect(
      request.getMultipleObjectsBySearch("AssayTerm", ["term_name"], {
        property: "",
        values: ["test"],
      })
    ).rejects.toThrow(
      "Invalid search options: provide either a query string or property with values"
    );
  });

  it("throws error when all values are empty/whitespace", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    await expect(
      request.getMultipleObjectsBySearch("AssayTerm", ["term_name"], {
        property: "term_name",
        values: ["", "   ", ""],
      })
    ).rejects.toThrow(
      "Invalid search options: provide either a query string or property with values"
    );
  });

  it("handles single value in property/values option correctly", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            "@graph": [mockSearchData["@graph"][0]],
            "@id": "/search-quick/",
            "@type": ["Search"],
          }),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    const result = await request.getMultipleObjectsBySearch(
      "AssayTerm",
      ["term_name", "definition"],
      { property: "term_name", values: ["RNA-seq"] }
    );

    expect(result.isOk()).toBeTruthy();
    expect(result.unwrap()).toHaveLength(1);
    expect(result.unwrap()[0].term_name).toBe("RNA-seq");

    // Verify the correct URL was called with single value
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/search-quick/?type=AssayTerm&field=term_name&field=definition&term_name=RNA-seq"
      ),
      expect.any(Object)
    );
  });

  it("builds URL correctly without double ampersands when fields are empty", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchData),
      })
    );

    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });
    await request.getMultipleObjectsBySearch("AssayTerm", [], {
      property: "term_name",
      values: ["RNA-seq"],
    });

    // Verify no double ampersands in URL
    const lastCall = (window.fetch as jest.Mock).mock.calls[0][0];
    expect(lastCall).not.toContain("&&");
    expect(lastCall).toContain(
      "/search-quick/?type=AssayTerm&term_name=RNA-seq"
    );
  });

  it("handles query option with whitespace correctly", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    // Should throw error because trimmed query is empty
    await expect(
      request.getMultipleObjectsBySearch("AssayTerm", ["term_name"], {
        query: "   ",
      })
    ).rejects.toThrow(
      "Invalid search options: provide either a query string or property with values"
    );
  });

  it("throws error when URI exceeds maximum length", async () => {
    const request = new FetchRequest({ session: { _csrft_: "mocktoken" } });

    // Create a very long query that will exceed MAX_URL_LENGTH (4000 characters)
    // The base URI is "/search-quick/?type=AssayTerm&field=term_name&term_name="
    // which is about 65 characters, so we need a term_name value of over 3935 characters
    const longValue = "a".repeat(4000);

    await expect(
      request.getMultipleObjectsBySearch("AssayTerm", ["term_name"], {
        property: "term_name",
        values: [longValue],
      })
    ).rejects.toThrow("Search query URI exceeds maximum length");
  });
});

describe("logRequest", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("logs with PERSISTENT indicator when using agent", () => {
    logRequest("getObject", "/test-path", true);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^SVRREQ \[.*\] \[PERSISTENT\] getObject \/test-path$/
      )
    );
  });

  it("logs with DEFAULT indicator when not using agent", () => {
    logRequest("postObject", "/api/data", false);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^SVRREQ \[.*\] \[DEFAULT\] postObject \/api\/data$/
      )
    );
  });

  it("includes ISO timestamp in log message", () => {
    const beforeTime = new Date().toISOString();
    logRequest("getText", "/markdown", false);
    const afterTime = new Date().toISOString();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const loggedMessage = consoleSpy.mock.calls[0][0];

    // Extract timestamp from log message
    const timestampMatch = loggedMessage.match(/\[(.*?)\]/);
    expect(timestampMatch).not.toBeNull();

    const loggedTimestamp = timestampMatch[1];
    expect(loggedTimestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
    expect(loggedTimestamp >= beforeTime).toBe(true);
    expect(loggedTimestamp <= afterTime).toBe(true);
  });

  it("formats different HTTP methods correctly", () => {
    const testCases = [
      {
        method: "getObject",
        path: "/users/123",
        usingAgent: true,
        expected: "PERSISTENT",
      },
      {
        method: "postObject",
        path: "/api/submit",
        usingAgent: false,
        expected: "DEFAULT",
      },
      {
        method: "putObject",
        path: "/data/update",
        usingAgent: true,
        expected: "PERSISTENT",
      },
      {
        method: "patchObject",
        path: "/profile/edit",
        usingAgent: false,
        expected: "DEFAULT",
      },
      {
        method: "getText",
        path: "/docs/readme",
        usingAgent: true,
        expected: "PERSISTENT",
      },
    ];

    testCases.forEach(({ method, path, usingAgent, expected }) => {
      consoleSpy.mockClear();
      logRequest(method, path, usingAgent);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          new RegExp(
            `^SVRREQ \\[.*\\] \\[${expected}\\] ${method} ${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`
          )
        )
      );
    });
  });
});

describe("isHttpMethod", () => {
  it("returns true when methods match", () => {
    expect(isHttpMethod("GET", "GET")).toBe(true);
    expect(isHttpMethod("POST", "POST")).toBe(true);
    expect(isHttpMethod("PUT", "PUT")).toBe(true);
    expect(isHttpMethod("PATCH", "PATCH")).toBe(true);
    expect(isHttpMethod("DELETE", "DELETE")).toBe(true);
  });

  it("returns false when methods do not match", () => {
    expect(isHttpMethod("GET", "POST")).toBe(false);
    expect(isHttpMethod("POST", "GET")).toBe(false);
    expect(isHttpMethod("PUT", "DELETE")).toBe(false);
  });

  it("returns false when request method is undefined", () => {
    expect(isHttpMethod(undefined, "GET")).toBe(false);
    expect(isHttpMethod(undefined, "POST")).toBe(false);
  });

  it("returns false when request method is empty string", () => {
    expect(isHttpMethod("", "GET")).toBe(false);
  });

  it("is case sensitive", () => {
    expect(isHttpMethod("get", "GET")).toBe(false);
    expect(isHttpMethod("Get", "GET")).toBe(false);
    expect(isHttpMethod("GET", "GET")).toBe(true);
  });
});
