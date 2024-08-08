import { DataProviderObject, SessionObject } from "../../globals.d";
import {
  detectConflictingName,
  generatePageParentPaths,
  getPageTitleAndCodes,
  PageLayoutComponent,
  PageMeta,
  PageObject,
  rewriteBlockIds,
  savePage,
  sliceBlocks,
} from "../page";

describe("Test getPageTitleAndCodes", () => {
  it("Returns the title and codes if present in title", () => {
    let page: DataProviderObject = {
      title: "Page Title [first][second]",
    };
    expect(getPageTitleAndCodes(page)).toEqual({
      title: "Page Title",
      codes: ["first", "second"],
    });

    page = {
      title: "Page Title [first][]",
    };
    expect(getPageTitleAndCodes(page)).toEqual({
      title: "Page Title",
      codes: ["first"],
    });
  });

  it("Returns the title if codes not present in title", () => {
    const page: DataProviderObject = {
      title: "Page Title",
    };
    expect(getPageTitleAndCodes(page)).toEqual({
      title: "Page Title",
      codes: [],
    });
  });

  it("Returns the entire title and codes if codes are malformed", () => {
    const page: DataProviderObject = {
      title: "Page Title [first][second",
    };
    expect(getPageTitleAndCodes(page)).toEqual({
      title: "Page Title [first][second",
      codes: [],
    });
  });

  it("Returns no title nor codes if title is empty", () => {
    const page: DataProviderObject = {
      title: "",
    };
    expect(getPageTitleAndCodes(page)).toEqual({
      title: "",
      codes: [],
    });
  });
});

describe("Test detectConflictingName", () => {
  it("Returns true if the name conflicts with another page's name", () => {
    const pages: PageObject[] = [
      {
        "@type": ["Page", "Item"],
        name: "test-page",
        title: "Test Page",
      },
    ];
    expect(detectConflictingName("test-page", pages)).toBe(true);
  });

  it("Returns false if the name does not conflict with another page's name", () => {
    const pages: PageObject[] = [
      {
        "@type": ["Page", "Item"],
        name: "test-page",
        title: "Test Page",
      },
    ];
    expect(detectConflictingName("Another Page Name", pages)).toBe(false);
  });
});

describe("Test savePage()", () => {
  it("Updates a page object", async () => {
    const page: PageObject = {
      "@id": "/page/1",
      "@type": ["Page", "Item"],
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "page-title",
      title: "Page Title",
      layout: {
        blocks: [
          {
            "@id": "#block1",
            "@type": "markdown",
            body: "Page content",
            direction: "ltr",
          },
        ],
      },
    };

    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Updated page content.",
        direction: "ltr",
      },
    ];

    const pageMeta: PageMeta = {
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "page-title",
      parent: "",
      status: "released",
      title: "Updated Page Title",
    };

    const session: SessionObject = {
      _csrft_: "6FnqvE30k90JdOE2fr9j1jOX1IsDctBJuQex34nv",
    };

    const expectedResult = {
      "@graph": [
        {
          "@id": "/page/1",
          "@type": ["Page", "Item"],
          creation_timestamp: "2023-04-26T17:26:45.360316+00:00",
          lab: "/labs/j-michael-cherry/",
          layout: {
            blocks: [
              {
                "@id": "#block1",
                "@type": "markdown",
                body: "# Ontologies Help\n\nThis is some help text about ontologies.",
                direction: "ltr",
              },
            ],
          },
          name: "page-title",
          parent: "/page/",
          schema_version: "3",
          status: "released",
          submitted_by: "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
          summary: "ontologies",
          title: "Ontologies [[40]]",
          uuid: "b32b3cb7-e22c-4445-8465-e7636783437d",
          length: 1,
        },
      ],
      "@type": ["result"],
      status: "success",
    };

    window.fetch = jest.fn().mockImplementation((url) => {
      if (url.substr(-11) === "?frame=edit") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({
            "@id": "http://localhost:3000/page/1",
            title: "Page Name",
            layout: {
              blocks: [
                {
                  "@id": "#block1",
                  "@type": "markdown",
                  body: "Page content",
                  direction: "ltr",
                },
              ],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(expectedResult),
      });
    });

    const isNewPage = false;
    const result = await savePage(page, blocks, pageMeta, session, isNewPage);
    expect(result).toEqual(expectedResult["@graph"][0]);
  });

  it("Creates a new page object", async () => {
    const initialPage: PageObject = {
      "@id": "/help/ontologies/",
      "@type": ["Page", "Item"],
      name: "",
      title: "",
      status: "in progress",
      layout: {
        blocks: [
          {
            "@id": "#block1",
            "@type": "markdown",
            body: "",
            direction: "ltr",
          },
        ],
      },
    };

    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Initial page content.",
        direction: "ltr",
      },
    ];

    const pageMeta: PageMeta = {
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "ontologies",
      parent: "/help/",
      status: "released",
      title: "Initial Page Title",
    };

    const session: SessionObject = {
      _csrft_: "6FnqvE30k90JdOE2fr9j1jOX1IsDctBJuQex34nv",
    };

    const expectedResult = {
      "@graph": [
        {
          "@id": "/help/ontologies/",
          "@type": ["Page", "Item"],
          creation_timestamp: "2023-04-26T17:26:45.360316+00:00",
          lab: "/labs/j-michael-cherry/",
          layout: {
            blocks: [
              {
                "@id": "#block1",
                "@type": "markdown",
                body: "# Ontologies Help\n\nThis is some help text about ontologies.",
                direction: "ltr",
              },
            ],
          },
          name: "ontologies",
          parent: "/help/",
          schema_version: "3",
          status: "released",
          submitted_by: "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
          summary: "ontologies",
          title: "Ontologies [[40]]",
          uuid: "b32b3cb7-e22c-4445-8465-e7636783437d",
          length: 1,
        },
      ],
      "@type": ["result"],
      status: "success",
    };

    window.fetch = jest.fn().mockImplementation((url) => {
      if (url.substr(-11) === "?frame=edit") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({
            "@id": "http://localhost:3000/page/1",
            title: "Page Name",
            layout: {
              blocks: [
                {
                  "@id": "#block1",
                  "@type": "markdown",
                  body: "Page content",
                  direction: "ltr",
                },
              ],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(expectedResult),
      });
    });

    const isNewPage = true;
    const result = await savePage(
      initialPage,
      blocks,
      pageMeta,
      session,
      isNewPage
    );
    expect(result).toEqual(expectedResult["@graph"][0]);
  });

  it("Returns an error object from getting the editable object", async () => {
    const page: PageObject = {
      "@id": "http://localhost:3000/page/1",
      "@type": ["Page", "Item"],
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "page-title",
      title: "Page Title",
      layout: {
        blocks: [
          {
            "@id": "#block1",
            "@type": "markdown",
            body: "Page content",
            direction: "ltr",
          },
        ],
      },
    };

    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Initial page content.",
        direction: "ltr",
      },
    ];

    const pageMeta: PageMeta = {
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "page-title",
      parent: "",
      status: "released",
      title: "Initial Page Title",
    };

    const session: SessionObject = {
      _csrft_: "6FnqvE30k90JdOE2fr9j1jOX1IsDctBJuQex34nv",
    };

    const errorReturn = {
      "@type": ["CSRFTokenError", "Error"],
      code: 400,
      description:
        "The server could not comply with the request since it is either malformed or otherwise incorrect.",
      detail: "Missing CSRF token",
      status: "error",
      title: "Bad Request",
    };

    window.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue(errorReturn),
      });
    });

    const isNewPage = false;
    const result = await savePage(page, blocks, pageMeta, session, isNewPage);
    expect(result).toEqual(errorReturn);
  });

  it("Returns an error object from writing an object", async () => {
    window.fetch = jest.fn().mockImplementation((url) => {
      if (url.substr(-11) === "?frame=edit") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({
            "@id": "http://localhost:3000/page/1",
            title: "Page Title",
            layout: {
              blocks: [
                {
                  "@id": "#block1",
                  "@type": "markdown",
                  body: "Page content",
                  direction: "ltr",
                },
              ],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({
          "@type": ["CSRFTokenError", "Error"],
          code: 400,
          description:
            "The server could not comply with the request since it is either malformed or otherwise incorrect.",
          detail: "Missing CSRF token",
          status: "error",
          title: "Bad Request",
        }),
      });
    });

    const page: PageObject = {
      "@id": "http://localhost:3000/page/1",
      "@type": ["Page", "Item"],
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "page-title",
      title: "Page Title",
      layout: {
        blocks: [
          {
            "@id": "#block1",
            "@type": "markdown",
            body: "Page content",
            direction: "ltr",
          },
        ],
      },
    };

    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Updated page content.",
        direction: "ltr",
      },
    ];

    const pageMeta: PageMeta = {
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      name: "page-title",
      parent: "",
      status: "released",
      title: "Updated Page Title",
    };

    const session = {
      _csrft_: "6FnqvE30k90JdOE2fr9j1jOX1IsDctBJuQex34nv",
    };

    const isNewPage = false;
    const result = await savePage(page, blocks, pageMeta, session, isNewPage);
    expect(result.status).toEqual("error");
  });
});

describe("Test rewriteBlockIds()", () => {
  it("Rewrites block IDs", () => {
    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block14",
        "@type": "markdown",
        body: "Page content 14",
        direction: "ltr",
      },
      {
        "@id": "#block8",
        "@type": "markdown",
        body: "Page content 8",
        direction: "ltr",
      },
    ];

    rewriteBlockIds(blocks);
    expect(blocks).toEqual([
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Page content 14",
        direction: "ltr",
      },
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 8",
        direction: "ltr",
      },
    ]);
  });
});

describe("Test sliceBlocks()", () => {
  it("Copies a segment of blocks", () => {
    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Page content 1",
        direction: "ltr",
      },
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 2",
        direction: "ltr",
      },
      {
        "@id": "#block3",
        "@type": "markdown",
        body: "Page content 3",
        direction: "ltr",
      },
      {
        "@id": "#block4",
        "@type": "markdown",
        body: "Page content 4",
        direction: "ltr",
      },
      {
        "@id": "#block5",
        "@type": "markdown",
        body: "Page content 5",
        direction: "ltr",
      },
    ];

    const result = sliceBlocks(blocks, 1, 3);
    expect(result).toEqual([
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 2",
        direction: "ltr",
      },
      {
        "@id": "#block3",
        "@type": "markdown",
        body: "Page content 3",
        direction: "ltr",
      },
    ]);
  });

  it("Copies all the blocks when passing no limits", () => {
    const blocks: PageLayoutComponent[] = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Page content 1",
        direction: "ltr",
      },
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 2",
        direction: "ltr",
      },
      {
        "@id": "#block3",
        "@type": "markdown",
        body: "Page content 3",
        direction: "ltr",
      },
    ];

    const result = sliceBlocks(blocks);
    expect(result).toEqual(blocks);
  });
});

describe("Test generatePageParentPaths function", () => {
  it("generates the parent paths for a three-element path", () => {
    const path = "/data/ontologies/assay";
    const result = generatePageParentPaths(path);
    expect(result).toEqual(["/data/", "/data/ontologies/"]);
  });

  it("generates the parent paths for a two-element path", () => {
    const path = "/data/ontologies";
    const result = generatePageParentPaths(path);
    expect(result).toEqual(["/data/"]);
  });

  it("generates no parent paths for a one-element path", () => {
    const path = "/data";
    const result = generatePageParentPaths(path);
    expect(result).toEqual([]);
  });

  it("generates the parent paths for a three-element help path", () => {
    const path = "/help/ontologies/assay";
    const result = generatePageParentPaths(path);
    expect(result).toEqual(["/help/ontologies/"]);
  });

  it("generates no parent paths for a two-element help path", () => {
    const path = "/help/ontologies";
    const result = generatePageParentPaths(path);
    expect(result).toEqual([]);
  });

  it("generates no parent paths for the '/help' path", () => {
    const path = "/help";
    const result = generatePageParentPaths(path);
    expect(result).toEqual([]);
  });
});
