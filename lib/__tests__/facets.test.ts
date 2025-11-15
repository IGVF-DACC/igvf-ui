import {
  checkForBooleanFacet,
  checkHierarchicalFacet,
  collectAllChildFacets,
  filterOutChildFacets,
  generateFacetStoreKey,
  getAllFacetsFromQuery,
  getFacetConfig,
  getFacetOrder,
  getFilterTerm,
  getTermSelections,
  getVisibleFacets,
  getVisibleFilters,
  setFacetConfig,
  setFacetOrder,
} from "../facets";
import FetchRequest from "../fetch-request";
import type { SearchResultsFacet, SearchResultsFilter } from "../../globals";

describe("Test the getFilterTerm function", () => {
  it("should return the term if it's not a wildcard", () => {
    const filter: SearchResultsFilter = {
      field: "type",
      remove: "/search/?type=InVitroSystem",
      term: "InVitroSystem",
    };
    expect(getFilterTerm(filter)).toEqual("InVitroSystem");
  });

  it("should return ANY if the term is *", () => {
    const filter: SearchResultsFilter = {
      field: "type",
      remove: "/search/?type=InVitroSystem",
      term: "*",
    };
    expect(getFilterTerm(filter)).toEqual("ANY");
  });

  it("should return NOT if the term is !*", () => {
    const filter: SearchResultsFilter = {
      field: "type!",
      remove: "/search/?type=InVitrosystem",
      term: "*",
    };
    expect(getFilterTerm(filter)).toEqual("NOT");
  });
});

describe("Test the getVisibleFacets function", () => {
  it("should filter out hidden facet fields", () => {
    const facets: SearchResultsFacet[] = [
      {
        field: "type",
        title: "Object Type",
        terms: [
          {
            key: "InVitroSystem",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 1,
      },
      {
        field: "foo",
        title: "Foo",
        terms: [
          {
            key: "one",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 1,
      },
      {
        field: "bar",
        title: "Bar",
        terms: [{ key: "two", doc_count: 1 }],
        type: "terms",
        total: 1,
      },
      {
        field: "audit.INTERNAL_ACTION.category",
        title: "Audit category: DCC ACTION",
        terms: [{ key: "mismatched status", doc_count: 1 }],
        type: "terms",
        total: 1,
      },
    ];
    const expectedSignedOut: SearchResultsFacet[] = [
      {
        field: "foo",
        title: "Foo",
        terms: [
          {
            key: "one",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 1,
      },
      {
        field: "bar",
        title: "Bar",
        terms: [{ key: "two", doc_count: 1 }],
        type: "terms",
        total: 1,
      },
    ];
    const expectedSignedIn: SearchResultsFacet[] = [
      {
        field: "foo",
        title: "Foo",
        terms: [
          {
            key: "one",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 1,
      },
      {
        field: "bar",
        title: "Bar",
        terms: [{ key: "two", doc_count: 1 }],
        type: "terms",
        total: 1,
      },
      {
        field: "audit.INTERNAL_ACTION.category",
        title: "Audit category: DCC ACTION",
        terms: [{ key: "mismatched status", doc_count: 1 }],
        type: "terms",
        total: 1,
      },
    ];

    expect(getVisibleFacets(facets, false)).toEqual(expectedSignedOut);
    expect(getVisibleFacets(facets, true)).toEqual(expectedSignedIn);
  });
});

describe("Test the getVisibleFilters function", () => {
  it("should filter out hidden facet fields", () => {
    const filters: SearchResultsFilter[] = [
      {
        field: "assay_term.term_name",
        term: "MPRA",
        remove:
          "/search/?type=MeasurementSet&status%21=deleted&audit.INTERNAL_ACTION.category=mismatched+status",
      },
      {
        field: "audit.INTERNAL_ACTION.category",
        term: "mismatched status",
        remove:
          "/search/?type=MeasurementSet&status%21=deleted&assay_term.term_name=MPRA",
      },
      {
        field: "type",
        term: "MeasurementSet",
        remove:
          "/search/?status%21=deleted&assay_term.term_name=MPRA&audit.INTERNAL_ACTION.category=mismatched+status",
      },
    ];

    expect(getVisibleFilters(filters, false)).toEqual([
      {
        field: "assay_term.term_name",
        term: "MPRA",
        remove:
          "/search/?type=MeasurementSet&status%21=deleted&audit.INTERNAL_ACTION.category=mismatched+status",
      },
    ]);

    expect(getVisibleFilters(filters, true)).toEqual([
      {
        field: "assay_term.term_name",
        term: "MPRA",
        remove:
          "/search/?type=MeasurementSet&status%21=deleted&audit.INTERNAL_ACTION.category=mismatched+status",
      },
      {
        field: "audit.INTERNAL_ACTION.category",
        term: "mismatched status",
        remove:
          "/search/?type=MeasurementSet&status%21=deleted&assay_term.term_name=MPRA",
      },
    ]);
  });
});

describe("Test the checkHierarchicalFacet function", () => {
  it("returns true if a facet contains sub facets", () => {
    expect(
      checkHierarchicalFacet({
        field: "preferred_assay_title",
        title: "Preferred Assay Title",
        terms: [
          {
            key: "MPRA",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 3,
      })
    ).toEqual(false);

    expect(
      checkHierarchicalFacet({
        field: "assay_term.assay_slims",
        title: "Assay",
        terms: [
          {
            key: "Massively parallel reporter assay",
            doc_count: 5,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "MPRA",
                  doc_count: 3,
                },
                {
                  key: "STARR-seq",
                  doc_count: 2,
                },
              ],
            },
          },
          {
            key: "Single cell",
            doc_count: 3,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "single-cell RNA sequencing assay",
                  doc_count: 3,
                },
              ],
            },
          },
        ],
        type: "terms",
        total: 23,
      })
    ).toEqual(true);
  });
});

describe("Test the CollectAllChildFacets function", () => {
  it("should collect all child facets", () => {
    const facets: SearchResultsFacet[] = [
      {
        field: "assay_term.assay_slims",
        title: "Assay",
        terms: [
          {
            key: "Massively parallel reporter assay",
            doc_count: 5,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "MPRA",
                  doc_count: 3,
                },
                {
                  key: "STARR-seq",
                  doc_count: 2,
                },
              ],
            },
          },
          {
            key: "Single cell",
            doc_count: 3,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "single-cell RNA sequencing assay",
                  doc_count: 3,
                },
              ],
            },
          },
          {
            key: "Transcription",
            doc_count: 3,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "single-cell RNA sequencing assay",
                  doc_count: 3,
                },
              ],
            },
          },
        ],
        type: "terms",
        total: 23,
      },
      {
        field: "preferred_assay_title",
        title: "Preferred Assay Title",
        terms: [
          {
            key: "MPRA",
            doc_count: 1,
          },
          {
            key: "MPRA (scQer)",
            doc_count: 1,
          },
          {
            key: "lentiMPRA",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 3,
      },
    ];

    expect(collectAllChildFacets(facets)).toEqual([
      {
        field: "assay_term.term_name",
        title: "Assay Term Name",
        terms: [
          {
            key: "MPRA",
            doc_count: 3,
          },
          {
            key: "STARR-seq",
            doc_count: 2,
          },
        ],
      },
    ]);
  });
});

describe("Test filterOutChildFacets function", () => {
  it("shouldn't filter out anything if no hierarchical facets are present", () => {
    const facets: SearchResultsFacet[] = [
      {
        field: "taxa",
        title: "Taxa",
        terms: [
          {
            key: "Homo sapiens",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 1,
      },
      {
        field: "status",
        title: "Status",
        terms: [
          {
            key: "released",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 1,
      },
      {
        field: "geneid",
        title: "geneid",
        terms: [
          {
            key: "ENSG00000163930",
            isEqual: true,
          },
        ],
        type: "terms",
        appended: true,
        total: 1,
      },
    ];

    expect(filterOutChildFacets(facets)).toEqual(facets);
  });

  it("filters out child facets that appear as non-configured facets", () => {
    const facets: SearchResultsFacet[] = [
      {
        field: "assay_term.assay_slims",
        title: "Assay",
        terms: [
          {
            key: "Massively parallel reporter assay",
            doc_count: 6,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "MPRA",
                  doc_count: 3,
                },
                {
                  key: "STARR-seq",
                  doc_count: 3,
                },
              ],
            },
          },
          {
            key: "Single cell",
            doc_count: 4,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "single-cell RNA sequencing assay",
                  doc_count: 4,
                },
              ],
            },
          },
        ],
        type: "terms",
        total: 30,
      },
      {
        field: "preferred_assay_title",
        title: "Preferred Assay Title",
        terms: [
          {
            key: "MPRA",
            doc_count: 1,
          },
          {
            key: "MPRA (scQer)",
            doc_count: 1,
          },
          {
            key: "lentiMPRA",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 3,
        appended: false,
      },
      {
        field: "assay_term.term_name",
        title: "assay_term.term_name",
        terms: [
          {
            key: "MPRA",
            isEqual: true,
          },
        ],
        type: "terms",
        appended: true,
        total: 3,
      },
    ];
    const expectedResults: SearchResultsFacet[] = [
      {
        field: "assay_term.assay_slims",
        title: "Assay",
        terms: [
          {
            key: "Massively parallel reporter assay",
            doc_count: 6,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "MPRA",
                  doc_count: 3,
                },
                {
                  key: "STARR-seq",
                  doc_count: 3,
                },
              ],
            },
          },
          {
            key: "Single cell",
            doc_count: 4,
            subfacet: {
              field: "assay_term.term_name",
              title: "Assay Term Name",
              terms: [
                {
                  key: "single-cell RNA sequencing assay",
                  doc_count: 4,
                },
              ],
            },
          },
        ],
        type: "terms",
        total: 30,
      },
      {
        field: "preferred_assay_title",
        title: "Preferred Assay Title",
        terms: [
          {
            key: "MPRA",
            doc_count: 1,
          },
          {
            key: "MPRA (scQer)",
            doc_count: 1,
          },
          {
            key: "lentiMPRA",
            doc_count: 1,
          },
        ],
        type: "terms",
        total: 3,
        appended: false,
      },
    ];

    expect(filterOutChildFacets(facets)).toEqual(expectedResults);
  });
});

describe("Test the getTermSelections function", () => {
  it("should return only non-selected terms for a facet with no selections", () => {
    const facet: SearchResultsFacet = {
      field: "lab.title",
      title: "Lab",
      terms: [
        {
          key: "J Michael Cherry, Stanford",
          doc_count: 3,
        },
      ],
      type: "terms",
      total: 3,
    };

    const filters = [
      {
        field: "type",
        term: "MeasurementSet",
        remove: "/search/",
      },
    ];

    const { selectedTerms, negativeTerms, nonSelectedTerms } =
      getTermSelections(facet, filters);
    expect(selectedTerms).toEqual([]);
    expect(negativeTerms).toEqual([]);
    expect(nonSelectedTerms).toEqual(["J Michael Cherry, Stanford"]);
  });

  it("should return selected terms for a facet with selections", () => {
    const facet: SearchResultsFacet = {
      field: "lab.title",
      title: "Lab",
      terms: [
        {
          key: "J Michael Cherry, Stanford",
          doc_count: 3,
        },
      ],
      type: "terms",
      total: 3,
    };

    const filters = [
      {
        field: "type",
        term: "MeasurementSet",
        remove: "/search/",
      },
      {
        field: "lab.title",
        term: "J Michael Cherry, Stanford",
        remove: "/search/",
      },
    ];

    const { selectedTerms, negativeTerms, nonSelectedTerms } =
      getTermSelections(facet, filters);
    expect(selectedTerms).toEqual(["J Michael Cherry, Stanford"]);
    expect(negativeTerms).toEqual([]);
    expect(nonSelectedTerms).toEqual([]);
  });

  it("should return negative-selected terms for a facet with negative selections", () => {
    const facet: SearchResultsFacet = {
      field: "lab.title",
      title: "Lab",
      terms: [
        {
          key: "J Michael Cherry, Stanford",
          doc_count: 3,
        },
      ],
      type: "terms",
      total: 3,
    };

    const filters = [
      {
        field: "type",
        term: "MeasurementSet",
        remove: "/search/",
      },
      {
        field: "lab.title!",
        term: "J Michael Cherry, Stanford",
        remove: "/search/",
      },
    ];

    const { selectedTerms, negativeTerms, nonSelectedTerms } =
      getTermSelections(facet, filters);
    expect(selectedTerms).toEqual([]);
    expect(negativeTerms).toEqual(["J Michael Cherry, Stanford"]);
    expect(nonSelectedTerms).toEqual([]);
  });

  it("should return selected child facets for a hierarchical facet with selections", () => {
    const facet: SearchResultsFacet = {
      field: "assay_term.assay_slims",
      title: "Assay",
      terms: [
        {
          key: "Massively parallel reporter assay",
          doc_count: 5,
          subfacet: {
            field: "assay_term.term_name",
            title: "Assay Term Name",
            terms: [
              {
                key: "MPRA",
                doc_count: 3,
              },
              {
                key: "STARR-seq",
                doc_count: 2,
              },
            ],
          },
        },
      ],
      type: "terms",
      total: 23,
    };

    const filters = [
      {
        field: "type",
        term: "MeasurementSet",
        remove: "/search/",
      },
      {
        field: "assay_term.term_name",
        term: "MPRA",
        remove: "/search/",
      },
    ];

    const { selectedTerms, negativeTerms, nonSelectedTerms } =
      getTermSelections(facet, filters);
    expect(selectedTerms).toEqual(["MPRA"]);
    expect(negativeTerms).toEqual([]);
    expect(nonSelectedTerms).toEqual(["STARR-seq"]);
  });

  it("should return return an empty array for a stats facet", () => {
    const facet: SearchResultsFacet = {
      field: "file_size",
      title: "File Size",
      terms: {
        count: 2,
        min: 9828031,
        max: 98280399,
        avg: 54054215,
        sum: 108108430,
      },
      total: 2,
      type: "stats",
      appended: false,
    };

    const filters: SearchResultsFilter[] = [
      {
        field: "type",
        term: "File",
        remove: "/search/",
      },
    ];

    const { selectedTerms, negativeTerms, nonSelectedTerms } =
      getTermSelections(facet, filters);
    expect(selectedTerms).toEqual([]);
    expect(negativeTerms).toEqual([]);
    expect(nonSelectedTerms).toEqual([]);
  });
});

describe("Test the generateFacetStoreKey function", () => {
  it("should generate a key for the user", () => {
    const uuid = "123";
    expect(generateFacetStoreKey("config", uuid)).toEqual("facet-config-123");
  });
});

describe("Test the getFacetConfig / setFacetConfig functions", () => {
  it("should get the facet configuration for the user and object type", async () => {
    const mockResult = { taxa: true };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const uuid = "123";
    const selectedType = "InVitroSystem";
    await expect(getFacetConfig(uuid, selectedType, request)).resolves.toEqual(
      mockResult
    );
  });

  it("should save the facet configuration for the user and object type", () => {
    const mockResult = { taxa: true };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const uuid = "123";
    const selectedType = "InVitroSystem";
    const config = { taxa: true };
    setFacetConfig(uuid, selectedType, config, request);

    expect(mockFunction).toHaveBeenCalledWith(
      `/api/facet-config/${uuid}/?type=${selectedType}`,
      {
        body: JSON.stringify(config),
        credentials: "include",
        headers: expect.any(Headers),
        method: "POST",
        redirect: "follow",
      }
    );
  });
});

describe("Test the checkForBooleanFacet function", () => {
  it("should return true for boolean facets where true is first", () => {
    const facet: SearchResultsFacet = {
      field: "standardized_file_format",
      title: "Standardized File Format",
      terms: [
        { key: 1, key_as_string: "true", doc_count: 10 },
        { key: 0, key_as_string: "false", doc_count: 5 },
      ],
      type: "terms",
      total: 15,
    };
    expect(checkForBooleanFacet(facet)).toBe(true);
  });

  it("should return true for boolean facets where false is first", () => {
    const facet: SearchResultsFacet = {
      field: "standardized_file_format",
      title: "Standardized File Format",
      terms: [
        { key: 0, key_as_string: "false", doc_count: 5 },
        { key: 1, key_as_string: "true", doc_count: 10 },
      ],
      type: "terms",
      total: 15,
    };
    expect(checkForBooleanFacet(facet)).toBe(true);
  });

  it("should return true for a boolean facet with just true", () => {
    const facet: SearchResultsFacet = {
      field: "standardized_file_format",
      title: "Standardized File Format",
      terms: [{ key: 1, key_as_string: "true", doc_count: 10 }],
      type: "terms",
      total: 10,
    };
    expect(checkForBooleanFacet(facet)).toBe(true);
  });

  it("should return true for a boolean facet with just false", () => {
    const facet: SearchResultsFacet = {
      field: "standardized_file_format",
      title: "Standardized File Format",
      terms: [{ key: 0, key_as_string: "false", doc_count: 5 }],
      type: "terms",
      total: 5,
    };
    expect(checkForBooleanFacet(facet)).toBe(true);
  });

  it("should return false for a terms facet with two true terms", () => {
    const facet: SearchResultsFacet = {
      field: "standardized_file_format",
      title: "Standardized File Format",
      terms: [
        { key: 0, key_as_string: "false", doc_count: 5 },
        { key: 1, key_as_string: "true", doc_count: 10 },
        { key: 1, key_as_string: "true", doc_count: 15 },
      ],
      type: "terms",
      total: 30,
    };
    expect(checkForBooleanFacet(facet)).toBe(false);
  });

  it("should return false for a terms facet", () => {
    const facet: SearchResultsFacet = {
      field: "type",
      title: "Object Type",
      terms: [
        { key: "InVitroSystem", doc_count: 1 },
        { key: "MeasurementSet", doc_count: 2 },
      ],
      type: "terms",
      total: 3,
    };
    expect(checkForBooleanFacet(facet)).toBe(false);
  });

  it("should return false for stats facets", () => {
    const facet: SearchResultsFacet = {
      field: "file_size",
      title: "File Size",
      terms: {
        count: 2,
        min: 9828031,
        max: 98280399,
        avg: 54054215,
        sum: 108108430,
      },
      total: 2,
      type: "stats",
      appended: false,
    };
    expect(checkForBooleanFacet(facet)).toBe(false);
  });
});

describe("Test the getFacetOrder / setFacetOrder functions", () => {
  it("should get the facet order for the user and object type", async () => {
    const mockResult = ["taxa", "lab.title", "status"];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const uuid = "abc-123";
    const selectedType = "MeasurementSet";

    await expect(getFacetOrder(uuid, selectedType, request)).resolves.toEqual(
      mockResult
    );

    expect(mockFunction).toHaveBeenCalledWith(
      `/api/facet-order/${uuid}/?type=${selectedType}`,
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should return null when facet order is not found", async () => {
    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    const request = new FetchRequest();
    const uuid = "abc-123";
    const selectedType = "MeasurementSet";

    const result = await getFacetOrder(uuid, selectedType, request);

    expect(result).toBeNull();
  });

  it("should save the facet order for the user and object type", async () => {
    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const request = new FetchRequest();
    const uuid = "abc-123";
    const selectedType = "MeasurementSet";
    const orderedFacetFields = ["taxa", "lab.title", "status"];

    await setFacetOrder(uuid, selectedType, orderedFacetFields, request);

    expect(mockFunction).toHaveBeenCalledWith(
      `/api/facet-order/${uuid}/?type=${selectedType}`,
      {
        body: JSON.stringify(orderedFacetFields),
        credentials: "include",
        headers: expect.any(Headers),
        method: "POST",
        redirect: "follow",
      }
    );
  });

  it("should handle empty array when saving facet order", async () => {
    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const request = new FetchRequest();
    const uuid = "user-456";
    const selectedType = "File";
    const orderedFacetFields: string[] = [];

    await setFacetOrder(uuid, selectedType, orderedFacetFields, request);

    expect(mockFunction).toHaveBeenCalledWith(
      `/api/facet-order/${uuid}/?type=${selectedType}`,
      {
        body: JSON.stringify(orderedFacetFields),
        credentials: "include",
        headers: expect.any(Headers),
        method: "POST",
        redirect: "follow",
      }
    );
  });
});

describe("Test the getAllFacetsFromQuery function", () => {
  it("should fetch all facets for a single type query", async () => {
    const mockFacets: SearchResultsFacet[] = [
      {
        field: "taxa",
        title: "Taxa",
        terms: [
          {
            key: "Homo sapiens",
            doc_count: 10,
          },
        ],
        type: "terms",
        total: 10,
      },
      {
        field: "status",
        title: "Status",
        terms: [
          {
            key: "released",
            doc_count: 5,
          },
        ],
        type: "terms",
        total: 5,
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            facets: mockFacets,
            "@graph": [],
            total: 0,
          }),
      })
    );

    const request = new FetchRequest();
    const query = { type: "MeasurementSet" };

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual(mockFacets);
    expect(mockFunction).toHaveBeenCalledWith(
      "/search/?type=MeasurementSet&limit=0",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should fetch all facets for a single type query when type is an array with one element", async () => {
    const mockFacets: SearchResultsFacet[] = [
      {
        field: "lab.title",
        title: "Lab",
        terms: [
          {
            key: "Lab 1",
            doc_count: 3,
          },
        ],
        type: "terms",
        total: 3,
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            facets: mockFacets,
            "@graph": [],
            total: 0,
          }),
      })
    );

    const request = new FetchRequest();
    const query = { type: ["File"] };

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual(mockFacets);
    expect(mockFunction).toHaveBeenCalledWith(
      "/search/?type=File&limit=0",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should fetch all facets when type is not specified", async () => {
    const mockFacets: SearchResultsFacet[] = [
      {
        field: "type",
        title: "Object Type",
        terms: [
          {
            key: "MeasurementSet",
            doc_count: 5,
          },
          {
            key: "File",
            doc_count: 3,
          },
        ],
        type: "terms",
        total: 8,
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            facets: mockFacets,
            "@graph": [],
            total: 0,
          }),
      })
    );

    const request = new FetchRequest();
    const query = {};

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual(mockFacets);
    expect(mockFunction).toHaveBeenCalledWith(
      "/search/?&limit=0",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should return empty array when response has no facets", async () => {
    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            "@graph": [],
            total: 0,
          }),
      })
    );

    const request = new FetchRequest();
    const query = { type: "UnknownType" };

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual([]);
  });

  it("should return empty array when response is null", async () => {
    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    const request = new FetchRequest();
    const query = { type: "MeasurementSet" };

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual([]);
  });

  it("should handle query with type as an array with multiple elements", async () => {
    const mockFacets: SearchResultsFacet[] = [
      {
        field: "status",
        title: "Status",
        terms: [
          {
            key: "released",
            doc_count: 10,
          },
        ],
        type: "terms",
        total: 10,
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            facets: mockFacets,
            "@graph": [],
            total: 0,
          }),
      })
    );

    const request = new FetchRequest();
    const query = { type: ["MeasurementSet", "File"] };

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual(mockFacets);

    // When type is an array with more than one element, no type query is added
    expect(mockFunction).toHaveBeenCalledWith(
      "/search/?&limit=0",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should handle complex query with other parameters", async () => {
    const mockFacets: SearchResultsFacet[] = [
      {
        field: "lab.title",
        title: "Lab",
        terms: [
          {
            key: "Lab A",
            doc_count: 2,
          },
        ],
        type: "terms",
        total: 2,
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            facets: mockFacets,
            "@graph": [],
            total: 0,
          }),
      })
    );

    const request = new FetchRequest();
    // Query with multiple parameters - only type should be used
    const query = {
      type: "AnalysisSet",
      status: "released",
      "lab.title": "Lab A",
    };

    const result = await getAllFacetsFromQuery(query, request);

    expect(result).toEqual(mockFacets);

    // Only type query parameter should be included
    expect(mockFunction).toHaveBeenCalledWith(
      "/search/?type=AnalysisSet&limit=0",
      expect.objectContaining({
        method: "GET",
      })
    );
  });
});
