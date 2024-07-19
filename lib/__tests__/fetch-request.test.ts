import _ from "lodash";
import FetchRequest, { HTTP_STATUS_CODE } from "../fetch-request";
import { DataProviderObject } from "../../globals";
import type { ErrorObject } from "../fetch-request.d";

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
});

describe("Test static isResponseSuccess function", () => {
  it("returns true for a successful response", () => {
    const response = {
      status: "success",
    };
    expect(FetchRequest.isResponseSuccess(response)).toBeTruthy();
  });
});
