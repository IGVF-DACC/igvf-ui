import {
  DatabaseObject,
  DataProviderObject,
  SearchResults,
} from "../../globals";
import buildBreadcrumbs from "../breadcrumbs";
import { generatePageParentPaths, REPLACE_TYPE } from "../breadcrumbs";

describe("Test breadcrumb composition and rendering functionality", () => {
  // Breadcrumb functions only happen on the server, so we need to mock the
  // server-side rendering environment by undefining the `window` object.
  // https://stackoverflow.com/questions/51425746/jest-js-force-window-to-be-undefined#answer-65188932
  const { window } = global;

  beforeAll(() => {
    Object.defineProperty(global, "window", {
      value: undefined,
    });
  });

  it("builds an item breadcrumb data properly", async () => {
    const profilesTitles = {
      Lab: "Lab",
      "@type": ["JSONSchemas"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(profilesTitles),
      })
    );

    const labItemData: DatabaseObject = {
      "@context": "/terms/",
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      title: "J. Michael Cherry, Stanford",
      creation_timestamp: "2021-10-29T00:00:00.000000+00:00",
      status: "current",
      uuid: "d91b048e-2d8a-4562-893d-93f0e68397c0",
    };

    let breadcrumbs = await buildBreadcrumbs(
      labItemData,
      "J. Michael Cherry, Stanford"
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Lab");
    expect(breadcrumbs[0].href).toBe("/search?type=Lab");
    expect(breadcrumbs[1].title).toBe("J. Michael Cherry, Stanford");
    expect(breadcrumbs[1].href).toBe("/labs/j-michael-cherry/");

    // Test using an object for which no profile schema exists.
    const unknownItemData: DatabaseObject = {
      "@context": "/terms/",
      "@id": "/unknowns/ACCESSION/",
      "@type": ["Unknown", "Item"],
      title: "An unknown item",
      creation_timestamp: "2021-10-29T00:00:00.000000+00:00",
      status: "current",
      uuid: "d91b048e-2d8a-4562-893d-93f0e68397c0",
    };

    breadcrumbs = await buildBreadcrumbs(
      unknownItemData,
      unknownItemData.title as string
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Unknown");
    expect(breadcrumbs[0].href).toBe("/search?type=Unknown");
    expect(breadcrumbs[1].title).toBe("An unknown item");
    expect(breadcrumbs[1].href).toBe("/unknowns/ACCESSION/");
  });

  it("builds an item breadcrumb when profile data isn't available", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    const humanDonorItemData: DatabaseObject = {
      "@context": "/terms/",
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      creation_timestamp: "2021-10-29T00:00:00.000000+00:00",
      status: "current",
      uuid: "d91b048e-2d8a-4562-893d-93f0e68397c0",
    };

    const breadcrumbs = await buildBreadcrumbs(
      humanDonorItemData,
      humanDonorItemData.accession as string
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("HumanDonor");
    expect(breadcrumbs[0].href).toBe("/search?type=HumanDonor");
    expect(breadcrumbs[1].title).toBe("IGVFDO856PXB");
    expect(breadcrumbs[1].href).toBe("/human-donors/IGVFDO856PXB/");
  });

  it("builds an item breadcrumb when profile data returns an error", async () => {
    const errorResponse = {
      "@type": ["HTTPNotFound", "Error"],
      status: "error",
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(errorResponse),
      })
    );

    const humanDonorItemData: DatabaseObject = {
      "@context": "/terms/",
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      creation_timestamp: "2021-10-29T00:00:00.000000+00:00",
      status: "current",
      uuid: "d91b048e-2d8a-4562-893d-93f0e68397c0",
    };

    const breadcrumbs = await buildBreadcrumbs(
      humanDonorItemData,
      humanDonorItemData.accession as string
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("HumanDonor");
    expect(breadcrumbs[0].href).toBe("/search?type=HumanDonor");
    expect(breadcrumbs[1].title).toBe("IGVFDO856PXB");
    expect(breadcrumbs[1].href).toBe("/human-donors/IGVFDO856PXB/");
  });

  it("builds a schema breadcrumb properly", async () => {
    const mockSchemaData: DataProviderObject = {
      title: "Primary Cell",
      description:
        "A biosample that is directly harvested from a donor as cells, such as fibroblasts or immune cells.",
      $id: "/profiles/primary_cell.json",
      "@type": ["JSONSchema"],
    };

    const breadcrumbs = await buildBreadcrumbs(
      mockSchemaData as DatabaseObject,
      "primary_cell"
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Schema Directory");
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

    const breadcrumbs = await buildBreadcrumbs(mockSchemaData, "");
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0].title).toBe("Schema Directory");
    expect(breadcrumbs[0].href).toBe("/profiles");
  });

  it("builds subpage breadcrumbs properly", async () => {
    const parentPageData: DataProviderObject = {
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
      subpageData.title as string,
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

  it("builds search-result breadcrumbs properly", async () => {
    const searchResultData: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/treatments/bd2cb34e-c72c-11ec-9d64-0242ac120002/",
          "@type": ["Treatment", "Item"],
          purpose: "differentiation",
          status: "released",
          treatment_term_id: "NTR:0001189",
          treatment_term_name: "new protein",
          treatment_type: "protein",
          uuid: "bd2cb34e-c72c-11ec-9d64-0242ac120002",
        },
      ],
      "@id": "/search?type=Treatment",
      "@type": ["Search"],
      clear_filters: "/search?type=Treatment",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        status: {
          title: "Status",
        },
      },
      facets: [
        {
          field: "purpose",
          terms: [
            {
              doc_count: 2,
              key: "differentiation",
            },
          ],
          title: "Purpose",
          total: 2,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "Treatment",
          remove: "/search",
        },
      ],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Search",
      total: 1,
    };

    const breadcrumbs = await buildBreadcrumbs(
      searchResultData as unknown as DataProviderObject,
      ""
    );
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Treatment",
      href: "/search?type=Treatment",
      operation: REPLACE_TYPE,
    });
  });

  it("builds search-result breadcrumbs with multiple types properly", async () => {
    const searchResultData: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/treatments/bd2cb34e-c72c-11ec-9d64-0242ac120002/",
          "@type": ["Treatment", "Item"],
          purpose: "differentiation",
          status: "released",
          treatment_term_id: "NTR:0001189",
          treatment_term_name: "new protein",
          treatment_type: "protein",
          uuid: "bd2cb34e-c72c-11ec-9d64-0242ac120002",
        },
      ],
      "@id": "/search?type=Treatment&type=Gene",
      "@type": ["Search"],
      clear_filters: "/search?type=Treatment&type=Gene",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        status: {
          title: "Status",
        },
      },
      facets: [
        {
          field: "purpose",
          terms: [
            {
              doc_count: 2,
              key: "differentiation",
            },
          ],
          title: "Purpose",
          total: 2,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "Treatment",
          remove: "/search",
        },
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Search",
      total: 1,
    };

    const breadcrumbs = await buildBreadcrumbs(
      searchResultData as unknown as DataProviderObject,
      ""
    );
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Multiple",
      href: "/search?type=Treatment&type=Gene",
      operation: REPLACE_TYPE,
    });
  });

  it("builds empty search-result breadcrumbs with no type filters", async () => {
    const searchResultData: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/treatments/bd2cb34e-c72c-11ec-9d64-0242ac120002/",
          "@type": ["Treatment", "Item"],
          purpose: "differentiation",
          status: "released",
          treatment_term_id: "NTR:0001189",
          treatment_term_name: "new protein",
          treatment_type: "protein",
          uuid: "bd2cb34e-c72c-11ec-9d64-0242ac120002",
        },
      ],
      "@id": "/search?type=Treatment",
      "@type": ["Search"],
      clear_filters: "/search?type=Treatment",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        status: {
          title: "Status",
        },
      },
      facets: [
        {
          field: "purpose",
          terms: [
            {
              doc_count: 2,
              key: "differentiation",
            },
          ],
          title: "Purpose",
          total: 2,
          type: "terms",
        },
      ],
      filters: [],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Search",
      total: 1,
    };

    const breadcrumbs = await buildBreadcrumbs(
      searchResultData as unknown as DataProviderObject,
      ""
    );
    expect(breadcrumbs).toHaveLength(0);
  });

  it("returns only current page breadcrumbs on network error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "mock network error";
    });

    const subpageData: DataProviderObject = {
      lab: "/labs/j-michael-cherry/",
      name: "subpage",
      title: "Sub Page",
      parent: "/parent-page/",
      "@id": "/parent-page/subpage/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(subpageData, "");
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Sub Page",
      href: "/parent-page/subpage/",
    });
  });

  it("builds top-level page breadcrumbs correctly", async () => {
    const topPageData: DataProviderObject = {
      lab: "/labs/j-michael-cherry/",
      name: "top-level-page",
      title: "Top-Level Page",
      "@id": "/top-level-page/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(topPageData, "");
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Top-Level Page",
      href: "/top-level-page/",
    });
  });
});

describe("Test breadcrumb utility functions", () => {
  it("generates no parent paths of a top-level page", () => {
    const parentPaths = generatePageParentPaths("/top-level-page/");
    expect(parentPaths).toHaveLength(0);
  });

  it("generates the parent paths of a second-level page", () => {
    const parentPaths = generatePageParentPaths("/parent-page/subpage/");
    expect(parentPaths).toHaveLength(1);
    expect(parentPaths[0]).toBe("/parent-page/");
  });

  it("generates the parent paths of a third-level page", () => {
    const parentPaths = generatePageParentPaths(
      "/parent-page/subpage/grandchild-page"
    );
    expect(parentPaths).toHaveLength(2);
    expect(parentPaths[0]).toBe("/parent-page/");
    expect(parentPaths[1]).toBe("/parent-page/subpage/");
  });

  it("skips the parent pages of a help page", () => {
    const parentPaths = generatePageParentPaths(
      "/help/first-level/second-level"
    );
    expect(parentPaths).toHaveLength(1);
    expect(parentPaths[0]).toBe("/help/first-level/");
  });
});
