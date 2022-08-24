import buildBreadcrumbs from "../breadcrumbs";
import { generateParentPaths } from "../breadcrumbs";

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

  it("builds subpage breadcrumbs properly", async () => {
    const parentPageData = {
      lab: "/labs/j-michael-cherry/",
      name: "parent-page",
      title: "Parent Page",
      "@id": "/parent-page/",
      "@type": ["Page", "Item"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(parentPageData),
      })
    );

    const subpageData = {
      lab: "/labs/j-michael-cherry/",
      name: "subpage",
      title: "Sub Page",
      parent: "/parent-page/",
      "@id": "/parent-page/subpage/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(
      subpageData,
      "title",
      "fake-cookie"
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({
      title: "Parent Page",
      href: "/parent-page/",
    });
    expect(breadcrumbs[1]).toEqual({
      title: "Sub Page",
      href: "/parent-page/subpage/",
    });
  });

  it("returns only current page breadcrumbs on network error", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    const subpageData = {
      lab: "/labs/j-michael-cherry/",
      name: "subpage",
      title: "Sub Page",
      parent: "/parent-page/",
      "@id": "/parent-page/subpage/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(subpageData);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Sub Page",
      href: "/parent-page/subpage/",
    });
  });

  it("builds top-level page breadcrumbs correctly", async () => {
    const topPageData = {
      lab: "/labs/j-michael-cherry/",
      name: "top-level-page",
      title: "Top-Level Page",
      "@id": "/top-level-page/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(topPageData);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Top-Level Page",
      href: "/top-level-page/",
    });
  });
});

describe("Test breadcrumb utility functions", () => {
  it("generates no parent paths of a top-level page", () => {
    const parentPaths = generateParentPaths("/top-level-page/");
    expect(parentPaths).toHaveLength(0);
  });

  it("generates the parent paths of a second-level page", () => {
    const parentPaths = generateParentPaths("/parent-page/subpage/");
    expect(parentPaths).toHaveLength(1);
    expect(parentPaths[0]).toBe("/parent-page/");
  });

  it("generates the parent paths of a third-level page", () => {
    const parentPaths = generateParentPaths(
      "/parent-page/subpage/grandchild-page"
    );
    expect(parentPaths).toHaveLength(2);
    expect(parentPaths[0]).toBe("/parent-page/");
    expect(parentPaths[1]).toBe("/parent-page/subpage/");
  });
});
