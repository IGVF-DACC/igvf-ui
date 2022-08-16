import _ from "lodash";
import FetchRequest from "../fetch-request";

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
    expect(labItem).toBeTruthy();
    expect(_.isEqual(labItem, mockData)).toBeTruthy();

    labItem = await request.getObject("/labs/j-michael-cherry/");
    expect(labItem).toBeTruthy();
    expect(_.isEqual(labItem, mockData)).toBeTruthy();
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
    window.fetch = jest.fn().mockImplementation((url) =>
      Promise.resolve({
        ok: true,
        json: () => {
          const matchingData =
            mockData.find((data) => url === data["@id"]) || null;
          return Promise.resolve(matchingData);
        },
      })
    );

    // Retrieve multiple lab items without filtering error results.
    const request = new FetchRequest({ session: { _csfrt_: "mocktoken" } });
    let labItems = await request.getMultipleObjects(
      ["/labs/j-michael-cherry/", "/labs/jesse-engreitz/", "/labs/unknown/"],
      null
    );
    expect(labItems).toBeTruthy();
    expect(labItems).toHaveLength(3);

    // Retrieve multiple lab items while filtering error results.
    labItems = await request.getMultipleObjects(
      ["/labs/j-michael-cherry/", "/labs/jesse-engreitz/", "/labs/unknown/"],
      null,
      { filterErrors: true }
    );
    expect(labItems).toBeTruthy();
    expect(labItems).toHaveLength(2);

    // Make sure passing an empty array returns an empty array.
    const noLabItems = await request.getMultipleObjects([], null);
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
    expect(_.isEqual(labCollection, mockData)).toBeTruthy();
  });

  it("requests a list of objects with embedded properties", async () => {
    const mockData = {
      "/labs/j-michael-cherry/": {
        name: "j-michael-cherry",
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      "/labs/jesse-engreitz/": {
        name: "jesse-engreitz",
        "@id": "/labs/jesse-engreitz/",
        "@type": ["Lab", "Item"],
        title: "Jesse Engreitz, Stanford University",
      },
    };
    window.fetch = jest.fn().mockImplementation((url) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData[url]),
      });
    });

    const items = [
      {
        "@id": "/users/986b362f-4eb6-4a9c-8173-3ab267307e3b/",
        "@type": ["User", "Item"],
        lab: "/labs/j-michael-cherry/",
        title: "Ben Hitz",
      },
      {
        "@id": "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
        "@type": ["User", "Item"],
        lab: "/labs/jesse-engreitz/",
        title: "Forrest Tanaka",
      },
      {
        "@id": "/users/24d01e13-37ef-4521-975b-a2f49533d19b",
        "@type": ["User", "Item"],
        lab: "/labs/anshul-kundaje/",
        title: "Anshul Kundaje",
      },
    ];

    const request = new FetchRequest();
    await request.getAndEmbedCollectionObjects(items, "lab");
    expect(typeof items[0].lab).toEqual("object");
    expect(items[0].lab["@id"]).toEqual("/labs/j-michael-cherry/");
    expect(typeof items[1].lab).toEqual("object");
    expect(items[1].lab["@id"]).toEqual("/labs/jesse-engreitz/");
    expect(items[2].lab).toBeNull();
  });

  it("receives a network error object when fetch throws an error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.getObject("/labs/j-michael-cherry/");
    expect(labItem).toBeTruthy();
    expect(labItem["@type"]).toContain("NetworkError");
    expect(labItem.status).toEqual("error");
    expect(labItem.code).toEqual("NETWORK");
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
    const labItem = await request.getObject("/labs/j-michael-cherry/", {
      notOK: "nope",
    });
    expect(labItem).toBeTruthy();
    expect(labItem.notOK).toEqual("nope");
  });

  it("returns a default error value on a network error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error";
    });

    const request = new FetchRequest();
    const labItem = await request.getObject("/labs/j-michael-cherry/", {
      notOK: "nope",
    });
    expect(labItem).toBeTruthy();
    expect(labItem.notOK).toEqual("nope");
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
    const markdown = await request.getText("/markdown/path");
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
    const markdown = await request.getText("/markdown/path");
    expect(markdown).toBeTruthy();
    expect(markdown["@type"]).toContain("NetworkError");
    expect(markdown.status).toEqual("error");
    expect(markdown.code).toEqual("NETWORK");
    expect(FetchRequest.isResponseSuccess(markdown)).toBeFalsy();
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
    expect(labItem.code).toEqual("NETWORK");
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
    expect(labItem.code).toEqual("NETWORK");
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
    expect(labItem.code).toEqual("NETWORK");
  });
});
