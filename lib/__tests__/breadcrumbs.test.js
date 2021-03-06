import buildBreadcrumbs from "../breadcrumbs";

describe("Test breadcrumb composition and rendering functionality", () => {
  // Breadcrumb functions only happen on the server, so we need to mock the
  // server-side rendering environment by undefining the `window` object.
  // https://stackoverflow.com/questions/51425746/jest-js-force-window-to-be-undefined#answer-65188932
  const { window } = global;

  beforeAll(() => {
    delete global.window;
  });

  afterAll(() => {
    global.window = window;
  });

  it("builds a collection breadcrumb data properly", async () => {
    const labCollectionData = {
      "@graph": [],
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    };
    const breadcrumbs = await buildBreadcrumbs(labCollectionData);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0].title).toBe("Labs");
    expect(breadcrumbs[0].href).toBe("/labs/");
  });

  it("builds an item breadcrumb data properly", async () => {
    // Mock lab collection retrieval.
    const mockCollectionData = {
      "@graph": [],
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCollectionData),
      })
    );

    const labItemData = {
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      title: "J. Michael Cherry, Stanford",
    };

    const breadcrumbs = await buildBreadcrumbs(labItemData, "title");
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Labs");
    expect(breadcrumbs[0].href).toBe("/labs/");
    expect(breadcrumbs[1].title).toBe("J. Michael Cherry, Stanford");
    expect(breadcrumbs[0].href).toBe("/labs/");
  });

  it("builds empty item breadcrumbs when given no data", async () => {
    const labItemData = {
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      title: "J. Michael Cherry, Stanford",
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    const breadcrumbs = await buildBreadcrumbs(
      labItemData,
      "title",
      "mockcookie"
    );
    expect(breadcrumbs).toHaveLength(0);
  });

  it("builds a schema breadcrumb properly", async () => {
    const mockSchemaData = {
      "@graph": [],
      title: "Primary Cell",
      description: "Schema for submitting a primary cell sample.",
      "@id": "/profiles/primary_cell.json",
      "@type": ["JSONSchema"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSchemaData),
      })
    );

    const breadcrumbs = await buildBreadcrumbs(mockSchemaData, "primary_cell");
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Schemas");
    expect(breadcrumbs[0].href).toBe("/profiles");
    expect(breadcrumbs[1].title).toBe("Primary Cell");
    expect(breadcrumbs[1].href).toBe("/profiles/primary_cell");
  });

  it("builds a schemas collection breadcrumb properly", async () => {
    const mockSchemaData = {
      "@type": ["JSONSchemas"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSchemaData),
      })
    );

    const breadcrumbs = await buildBreadcrumbs(mockSchemaData);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0].title).toBe("Schemas");
    expect(breadcrumbs[0].href).toBe("/profiles");
  });
});
