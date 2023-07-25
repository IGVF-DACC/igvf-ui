import {
  detectConflictingName,
  getPageTitleAndOrdering,
  rewriteBlockIds,
  savePage,
  sliceBlocks,
} from "../page";

describe("Test getPageTitleAndOrdering", () => {
  it("Returns the title and ordering if present in title", () => {
    const page = {
      title: "Page Title [[10]]",
    };
    expect(getPageTitleAndOrdering(page)).toEqual({
      title: "Page Title",
      ordering: 10,
    });
  });

  it("Returns the title if ordering is not present in title", () => {
    const page = {
      title: "Page Title",
    };
    expect(getPageTitleAndOrdering(page)).toEqual({
      title: "Page Title",
    });
  });
});

describe("Test detectConflictingName", () => {
  it("Returns true if the name conflicts with another page's name", () => {
    const pages = [
      {
        name: "Page Name",
      },
    ];
    expect(detectConflictingName("Page Name", pages)).toBe(true);
  });

  it("Returns false if the name does not conflict with another page's name", () => {
    const pages = [
      {
        name: "Page Name",
      },
    ];
    expect(detectConflictingName("Another Page Name", pages)).toBe(false);
  });
});

describe("Test savePage()", () => {
  it("Updates a page object", async () => {
    const page = {
      "@id": "http://localhost:3000/page/1",
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      title: "Page Title",
      layout: {
        blocks: [
          {
            "@type": "markdown",
            body: "Page content",
            direction: "ltr",
            title: "Page content",
          },
        ],
      },
    };

    const blocks = [
      {
        "@type": "markdown",
        body: "Updated page content.",
      },
    ];

    const pageMeta = {
      award: "/awards/HG",
      title: "Updated Page Title",
    };

    const session = {
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

    const isNewPage = false;
    const result = await savePage(page, blocks, pageMeta, session, isNewPage);
    expect(result).toEqual(expectedResult["@graph"][0]);
  });

  it("Creates a new page object", async () => {
    const initialPage = {
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

    const blocks = [
      {
        "@type": "markdown",
        body: "Initial page content.",
      },
    ];

    const pageMeta = {
      award: "/awards/HG",
      title: "Initial Page Title",
    };

    const session = {
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
      isNewPage,
    );
    expect(result).toEqual(expectedResult["@graph"][0]);
  });

  it("Returns an error object from getting the editable object", async () => {
    const page = {
      "@id": "http://localhost:3000/page/1",
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      title: "Page Title",
      layout: {
        blocks: [
          {
            "@type": "markdown",
            body: "Page content",
            direction: "ltr",
            title: "Page content",
          },
        ],
      },
    };

    const blocks = [
      {
        "@type": "markdown",
        body: "Initial page content.",
      },
    ];

    const pageMeta = {
      award: "/awards/HG",
      title: "Initial Page Title",
    };

    const session = {
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

    const page = {
      "@id": "http://localhost:3000/page/1",
      award: "/awards/HG",
      lab: "/lab/j-michael-cherry",
      title: "Page Title",
      layout: {
        blocks: [
          {
            "@type": "markdown",
            body: "Page content",
            direction: "ltr",
            title: "Page Title",
          },
        ],
      },
    };

    const blocks = [
      {
        "@type": "markdown",
        body: "Updated page content.",
      },
    ];

    const pageMeta = {
      award: "/awards/HG",
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
    const blocks = [
      {
        "@id": "#block14",
        "@type": "markdown",
        body: "Page content 14",
        direction: "ltr",
        title: "Page Content 14",
      },
      {
        "@id": "#block8",
        "@type": "markdown",
        body: "Page content 8",
        direction: "ltr",
        title: "Page Content 8",
      },
    ];

    rewriteBlockIds(blocks);
    expect(blocks).toEqual([
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Page content 14",
        direction: "ltr",
        title: "Page Content 14",
      },
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 8",
        direction: "ltr",
        title: "Page Content 8",
      },
    ]);
  });
});

describe("Test sliceBlocks()", () => {
  it("Copies a segment of blocks", () => {
    const blocks = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Page content 1",
        direction: "ltr",
        title: "Page Content 1",
      },
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 2",
        direction: "ltr",
        title: "Page Content 2",
      },
      {
        "@id": "#block3",
        "@type": "markdown",
        body: "Page content 3",
        direction: "ltr",
        title: "Page Content 3",
      },
      {
        "@id": "#block4",
        "@type": "markdown",
        body: "Page content 4",
        direction: "ltr",
        title: "Page Content 4",
      },
      {
        "@id": "#block5",
        "@type": "markdown",
        body: "Page content 5",
        direction: "ltr",
        title: "Page Content 5",
      },
    ];

    const result = sliceBlocks(blocks, 1, 3);
    expect(result).toEqual([
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 2",
        direction: "ltr",
        title: "Page Content 2",
      },
      {
        "@id": "#block3",
        "@type": "markdown",
        body: "Page content 3",
        direction: "ltr",
        title: "Page Content 3",
      },
    ]);
  });

  it("Copies all the blocks when passing no limits", () => {
    const blocks = [
      {
        "@id": "#block1",
        "@type": "markdown",
        body: "Page content 1",
        direction: "ltr",
        title: "Page Content 1",
      },
      {
        "@id": "#block2",
        "@type": "markdown",
        body: "Page content 2",
        direction: "ltr",
        title: "Page Content 2",
      },
      {
        "@id": "#block3",
        "@type": "markdown",
        body: "Page content 3",
        direction: "ltr",
        title: "Page Content 3",
      },
    ];

    const result = sliceBlocks(blocks);
    expect(result).toEqual(blocks);
  });
});
