import {
  CollectionTitles,
  DatabaseObject,
  SearchResults,
} from "../../globals.d";
import buildBreadcrumbs, { getBreadcrumbMeta } from "../breadcrumbs";
import FetchRequest from "../fetch-request";

declare const global: { window?: Window };

describe("Test breadcrumb composition and rendering functionality", () => {
  // Breadcrumb functions only happen on the server, so we need to mock the
  // server-side rendering environment by undefining the `window` object.
  // https://stackoverflow.com/questions/51425746/jest-js-force-window-to-be-undefined#answer-65188932
  beforeAll(() => {
    Object.defineProperty(global, "window", {
      value: undefined,
    });
  });

  it("builds an item breadcrumb data properly", async () => {
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

    const breadcrumbs = await buildBreadcrumbs(
      labItemData,
      "J. Michael Cherry, Stanford"
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Lab");
    expect(breadcrumbs[0].href).toBe("/search/?type=Lab");
    expect(breadcrumbs[1].title).toBe("J. Michael Cherry, Stanford");
  });

  it("builds a schema breadcrumb properly", async () => {
    const mockSchemaData: DatabaseObject = {
      title: "Primary Cell",
      description:
        "A biosample that is directly harvested from a donor as cells, such as fibroblasts or immune cells.",
      $id: "/profiles/primary_cell.json",
      "@type": ["JSONSchema"],
    };

    const breadcrumbs = await buildBreadcrumbs(mockSchemaData, "primary_cell");
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Schema Directory");
    expect(breadcrumbs[0].href).toBe("/profiles");
    expect(breadcrumbs[1].title).toBe("Primary Cell");
  });

  it("builds a schemas collection breadcrumb properly", async () => {
    const mockSchemaData = {
      "@type": ["JSONSchemas"],
    };

    const breadcrumbs = await buildBreadcrumbs(
      mockSchemaData,
      "Schema Directory",
      {}
    );
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0].title).toBe("Schema Directory");
  });

  it("builds page breadcrumbs properly", async () => {
    const meta = {
      parentPages: [],
    };

    const pageData = {
      lab: "/labs/j-michael-cherry/",
      name: "page",
      title: "Page",
      "@id": "/parent-page/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(pageData, pageData.title, meta);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Page",
    });
  });

  it("builds page breadcrumbs without meta", async () => {
    const meta = {};

    const pageData = {
      lab: "/labs/j-michael-cherry/",
      name: "page",
      title: "Page",
      "@id": "/parent-page/",
      "@type": ["Page", "Item"],
    };

    const breadcrumbs = await buildBreadcrumbs(pageData, pageData.title, meta);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Page",
    });
  });

  it("builds subpage breadcrumbs properly", async () => {
    const meta = {
      parentPages: [
        {
          lab: "/labs/j-michael-cherry/",
          name: "parent-page",
          title: "Parent Page",
          "@id": "/parent-page/",
          "@type": ["Page", "Item"],
        },
      ],
    };

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
      subpageData.title,
      meta
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({
      title: "Parent Page",
      href: "/parent-page/",
    });
    expect(breadcrumbs[1]).toEqual({
      title: "Sub Page",
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
      clear_filters: "/search/?type=Treatment",
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
      searchResultData as unknown as DatabaseObject,
      ""
    );
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Treatment",
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
      searchResultData as unknown as DatabaseObject,
      ""
    );
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      title: "Multiple",
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
      searchResultData as unknown as DatabaseObject,
      ""
    );
    expect(breadcrumbs).toHaveLength(0);
  });
});

describe("Test retrieving breadcrumb metadata", () => {
  const { window } = global;

  beforeEach(() => {
    delete global.window;
  });

  afterAll(() => {
    global.window = window;
  });

  it("retrieves Page metadata correctly with a parent page", async () => {
    const mockData = {
      "@id": "/search/?type=Page",
      "@type": ["Search"],
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
          name: "donors",
          status: "released",
          title: "Donors",
        },
      ],
      clear_filters: "/search/?type=Page",
      notification: "Success",
      title: "Search",
      total: 1,
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const pageData = {
      "@context": "/terms/",
      "@id": "/help/donors/human-donors/",
      "@type": ["Page", "Item"],
      creation_timestamp: "2024-07-27T20:00:34.886639+00:00",
      lab: "/labs/j-michael-cherry/",
      layout: {
        blocks: [],
      },
      name: "human-donors",
      parent: "/help/donors/",
      status: "released",
      submitted_by: {
        "@id": "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
        title: "Forrest Tanaka",
      },
      summary: "human-donors",
      title: "Human Donors",
      uuid: "d91b048e-2d8a-4562-893d-93f0e68397c0",
    };

    const request = new FetchRequest();
    const breadcrumbMeta = await getBreadcrumbMeta(pageData, request);
    expect(breadcrumbMeta).toEqual({
      parentPages: [
        {
          "@id": "/help/donors/",
          "@type": ["Page", "Item"],
          name: "donors",
          status: "released",
          title: "Donors",
        },
      ],
    });
  });

  it("retrieves no metadata for types that don't need it", async () => {
    const testData = {
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      award: {
        component: "data coordination",
        "@id": "/awards/HG012012/",
      },
      donors: ["/rodent-donors/IGVFDO7963CKTV/"],
      status: "released",
      accession: "IGVFSM0003DDDD",
      collections: ["ENCODE"],
      release_timestamp: "2024-03-06T12:34:56Z",
      creation_timestamp: "2024-07-27T20:00:45.634929+00:00",
      "@id": "/tissues/IGVFSM0003DDDD/",
      "@type": ["Tissue", "Biosample", "Sample", "Item"],
      uuid: "fd5524f2-0303-11ed-b939-0242ac120002",
      "@context": "/terms/",
    };

    const request = new FetchRequest();
    const breadcrumbMeta = await getBreadcrumbMeta(testData, request);
    expect(breadcrumbMeta).toEqual({});
  });

  it("adds a status!=deleted query parameter for admins", async () => {
    const data = {
      "@context": "/terms/",
      "@id": "/assay-terms/OBI_0002675/",
      "@type": ["AssayTerm", "OntologyTerm", "Item"],
      assay_slims: ["Massively parallel reporter assay"],
      creation_timestamp: "2024-07-27T20:00:26.048423+00:00",
      deprecated_ntr_terms: ["NTR:0000001", "NTR:0000010"],
      name: "OBI_0002675",
      release_timestamp: "2024-03-06T12:34:56Z",
      status: "released",
      summary: "MPRA",
      term_id: "OBI:0002675",
      term_name: "MPRA",
      uuid: "e6a5e43a-9e8c-fd28-967f-358e200536ab",
    };

    const collectionTitles = {
      "@type": ["CollectionTitles"],
      AssayTerm: "Assay Term",
    };

    // This has to be a Typescript bug, right? If I match the type of `collectionTitles` exactly it
    // says `collectionTitles` is not assignable to `CollectionTitles`. But if I cast it to
    // `CollectionTitles` it works fine.
    const breadcrumbs = buildBreadcrumbs(
      data,
      "OBI:0002675",
      { isAdmin: true },
      collectionTitles as unknown as CollectionTitles
    );
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].title).toBe("Assay Term");
    expect(breadcrumbs[0].href).toBe("/search/?type=AssayTerm&status!=deleted");
    expect(breadcrumbs[1].title).toBe("OBI:0002675");
  });
});
