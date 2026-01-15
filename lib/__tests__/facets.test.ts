import {
  checkForBooleanFacet,
  checkHierarchicalFacet,
  checkOptionalFacetsConfigurable,
  collectAllChildFacets,
  filterOutChildFacets,
  generateFacetStoreKey,
  getAllFacetsFromQuery,
  getFacetConfig,
  getFacetOrder,
  getFilterTerm,
  getOptionalFacetsConfigForType,
  getTermSelections,
  getVisibleFacets,
  getVisibleFilters,
  isValidOptionalFacetConfig,
  isValidOptionalFacetConfigForType,
  saveOptionalFacetsConfigForType,
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

    expect(getVisibleFacets(facets, [], "File", false)).toEqual(
      expectedSignedOut
    );
    expect(getVisibleFacets(facets, [], "File", true)).toEqual(
      expectedSignedIn
    );
  });

  it("should filter out optional facets not in config for configurable types", () => {
    const facets: SearchResultsFacet[] = [
      {
        field: "status",
        title: "Status",
        terms: [{ key: "released", doc_count: 5 }],
        type: "terms",
        total: 5,
        optional: false,
      },
      {
        field: "lab.title",
        title: "Lab",
        terms: [{ key: "Lab A", doc_count: 3 }],
        type: "terms",
        total: 3,
        optional: true,
      },
      {
        field: "award.component",
        title: "Award Component",
        terms: [{ key: "Data Analysis", doc_count: 2 }],
        type: "terms",
        total: 2,
        optional: true,
      },
    ];

    // For MeasurementSet (configurable type), only include optional facets in config
    const result = getVisibleFacets(
      facets,
      ["lab.title"], // Only lab.title is in the config
      "MeasurementSet",
      true
    );

    expect(result).toEqual([
      {
        field: "status",
        title: "Status",
        terms: [{ key: "released", doc_count: 5 }],
        type: "terms",
        total: 5,
        optional: false,
      },
      {
        field: "lab.title",
        title: "Lab",
        terms: [{ key: "Lab A", doc_count: 3 }],
        type: "terms",
        total: 3,
        optional: true,
      },
    ]);
  });

  it("should filter out all optional facets for non-configurable types", () => {
    const facets: SearchResultsFacet[] = [
      {
        field: "status",
        title: "Status",
        terms: [{ key: "released", doc_count: 5 }],
        type: "terms",
        total: 5,
        optional: false,
      },
      {
        field: "lab.title",
        title: "Lab",
        terms: [{ key: "Lab A", doc_count: 3 }],
        type: "terms",
        total: 3,
        optional: true,
      },
    ];

    // For InVitroSystem (non-configurable type), filter out all optional facets
    const result = getVisibleFacets(facets, [], "InVitroSystem", true);

    expect(result).toEqual([
      {
        field: "status",
        title: "Status",
        terms: [{ key: "released", doc_count: 5 }],
        type: "terms",
        total: 5,
        optional: false,
      },
    ]);
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

describe("Test checkOptionalFacetsConfigurable function", () => {
  it("should return true for types that allow optional facets", () => {
    expect(checkOptionalFacetsConfigurable("MeasurementSet")).toBe(true);
    expect(checkOptionalFacetsConfigurable("AnalysisSet")).toBe(true);
    expect(checkOptionalFacetsConfigurable("File")).toBe(true);
    expect(checkOptionalFacetsConfigurable("PredictionSet")).toBe(true);
  });

  it("should return false for types that don't allow optional facets", () => {
    expect(checkOptionalFacetsConfigurable("")).toBe(false);
    expect(checkOptionalFacetsConfigurable("UnknownType")).toBe(false);
    expect(checkOptionalFacetsConfigurable("InVitroSystem")).toBe(false);
  });
});

describe("Test isValidOptionalFacetConfigForType function", () => {
  it("should return true for valid config", () => {
    expect(isValidOptionalFacetConfigForType([])).toBe(true);
    expect(isValidOptionalFacetConfigForType(["facet1", "facet2"])).toBe(true);
  });

  it("should return false for non-arrays", () => {
    expect(isValidOptionalFacetConfigForType({})).toBe(false);
    expect(isValidOptionalFacetConfigForType(null)).toBe(false);
    expect(isValidOptionalFacetConfigForType(undefined)).toBe(false);
    expect(isValidOptionalFacetConfigForType("string")).toBe(false);
    expect(isValidOptionalFacetConfigForType(123)).toBe(false);
  });

  it("should return false for arrays with non-string elements", () => {
    expect(isValidOptionalFacetConfigForType([1, 2, 3])).toBe(false);
    expect(isValidOptionalFacetConfigForType(["valid", 123])).toBe(false);
    expect(isValidOptionalFacetConfigForType([{}, "valid"])).toBe(false);
  });

  it("should return false for arrays with empty strings", () => {
    expect(isValidOptionalFacetConfigForType([""])).toBe(false);
    expect(isValidOptionalFacetConfigForType(["valid", ""])).toBe(false);
  });

  it("should return false for arrays exceeding max facets per type", () => {
    const tooManyFacets = Array(101).fill("facet");
    expect(isValidOptionalFacetConfigForType(tooManyFacets)).toBe(false);
  });

  it("should return false for strings exceeding max length", () => {
    const tooLongString = "a".repeat(101);
    expect(isValidOptionalFacetConfigForType([tooLongString])).toBe(false);
  });
});

describe("Test isValidOptionalFacetConfig function", () => {
  it("should return true for valid config", () => {
    expect(isValidOptionalFacetConfig({})).toBe(true); // Empty objects not allowed
    expect(
      isValidOptionalFacetConfig({ MeasurementSet: ["facet1", "facet2"] })
    ).toBe(true);
    expect(
      isValidOptionalFacetConfig({
        MeasurementSet: ["facet1"],
        AnalysisSet: ["facet2"],
      })
    ).toBe(true);
  });

  it("should return false for non-objects", () => {
    expect(isValidOptionalFacetConfig(null)).toBe(false);
    expect(isValidOptionalFacetConfig(undefined)).toBe(false);
    expect(isValidOptionalFacetConfig([])).toBe(false);
    expect(isValidOptionalFacetConfig("string")).toBe(false);
    expect(isValidOptionalFacetConfig(123)).toBe(false);
  });

  it("should return false for empty objects", () => {
    expect(isValidOptionalFacetConfig({})).toBe(true);
  });

  it("should return false for objects exceeding max types", () => {
    const tooManyTypes: Record<string, string[]> = {};
    for (let i = 0; i < 51; i++) {
      tooManyTypes[`Type${i}`] = ["facet1"];
    }
    expect(isValidOptionalFacetConfig(tooManyTypes)).toBe(false);
  });

  it("should return false for invalid values", () => {
    expect(isValidOptionalFacetConfig({ MeasurementSet: "not-an-array" })).toBe(
      false
    );
    expect(isValidOptionalFacetConfig({ MeasurementSet: [123] })).toBe(false);
    expect(isValidOptionalFacetConfig({ MeasurementSet: [""] })).toBe(false);
  });

  it("should return false for empty string keys", () => {
    expect(isValidOptionalFacetConfig({ "": ["facet1"] })).toBe(false);
  });
});

describe("Test getOptionalFacetsConfigForType function", () => {
  let localStorageMock: { [key: string]: string };
  let getItemSpy: jest.Mock;
  let setItemSpy: jest.Mock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    getItemSpy = jest.fn((key: string) => localStorageMock[key] || null);
    setItemSpy = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
        key: jest.fn(),
        length: 0,
      },
      writable: true,
    });
  });

  it("should return empty array for authenticated user with no config", async () => {
    const mockFunction = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null),
      })
    );
    global.fetch = mockFunction as any;

    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      true
    );

    expect(result).toEqual([]);
  });

  it("should return config for authenticated user", async () => {
    const mockConfig = ["lab.title", "award.component"];
    const mockFunction = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockConfig),
      })
    );
    global.fetch = mockFunction as any;

    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      true
    );

    expect(result).toEqual(mockConfig);
  });

  it("should return empty array for authenticated user with invalid config", async () => {
    const mockFunction = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalid: "config" }),
      })
    );
    global.fetch = mockFunction as any;

    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      true
    );

    expect(result).toEqual([]);
  });

  it("should return empty array for non-authenticated user with no localStorage", async () => {
    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      false
    );

    expect(result).toEqual([]);
  });

  it("should return config from localStorage for non-authenticated user", async () => {
    const config = {
      MeasurementSet: ["lab.title", "award.component"],
      AnalysisSet: ["status"],
    };
    localStorageMock["facet-optional"] = JSON.stringify(config);

    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      false
    );

    expect(result).toEqual(["lab.title", "award.component"]);
  });

  it("should return empty array for non-authenticated user with invalid localStorage", async () => {
    localStorageMock["facet-optional"] = "invalid json";

    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      false
    );

    expect(result).toEqual([]);
  });

  it("should return empty array for non-authenticated user when type not in config", async () => {
    const config = {
      AnalysisSet: ["status"],
    };
    localStorageMock["facet-optional"] = JSON.stringify(config);

    const request = new FetchRequest();
    const result = await getOptionalFacetsConfigForType(
      "MeasurementSet",
      request,
      false
    );

    expect(result).toEqual([]);
  });
});

describe("Test saveOptionalFacetsConfigForType function", () => {
  let localStorageMock: { [key: string]: string };
  let setItemSpy: jest.Mock;
  let getItemSpy: jest.Mock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    getItemSpy = jest.fn((key: string) => localStorageMock[key] || null);
    setItemSpy = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
        key: jest.fn(),
        length: 0,
      },
      writable: true,
    });
  });

  it("should save config for authenticated user", async () => {
    const mockFunction = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
    );
    global.fetch = mockFunction as any;

    const request = new FetchRequest();
    const newConfig = ["lab.title", "award.component"];
    await saveOptionalFacetsConfigForType(
      "MeasurementSet",
      newConfig,
      request,
      true
    );

    expect(mockFunction).toHaveBeenCalledWith(
      expect.stringContaining("/api/facet-optional/MeasurementSet/"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(newConfig),
      })
    );
  });

  it("should save config to localStorage for non-authenticated user", async () => {
    const request = new FetchRequest();
    const newConfig = ["lab.title", "award.component"];

    await saveOptionalFacetsConfigForType(
      "MeasurementSet",
      newConfig,
      request,
      false
    );

    expect(setItemSpy).toHaveBeenCalledWith(
      "facet-optional",
      JSON.stringify({
        MeasurementSet: ["lab.title", "award.component"],
      })
    );
  });

  it("should merge with existing localStorage config for non-authenticated user", async () => {
    const existingConfig = {
      AnalysisSet: ["status"],
    };
    localStorageMock["facet-optional"] = JSON.stringify(existingConfig);

    const request = new FetchRequest();
    const newConfig = ["lab.title", "award.component"];

    await saveOptionalFacetsConfigForType(
      "MeasurementSet",
      newConfig,
      request,
      false
    );

    expect(setItemSpy).toHaveBeenCalledWith(
      "facet-optional",
      JSON.stringify({
        AnalysisSet: ["status"],
        MeasurementSet: ["lab.title", "award.component"],
      })
    );
  });

  it("should handle invalid existing localStorage config for non-authenticated user", async () => {
    localStorageMock["facet-optional"] = "invalid json";

    const request = new FetchRequest();
    const newConfig = ["lab.title"];

    await saveOptionalFacetsConfigForType(
      "MeasurementSet",
      newConfig,
      request,
      false
    );

    expect(setItemSpy).toHaveBeenCalledWith(
      "facet-optional",
      JSON.stringify({
        MeasurementSet: ["lab.title"],
      })
    );
  });

  it("should handle invalid structure in existing localStorage config", async () => {
    localStorageMock["facet-optional"] = JSON.stringify({
      MeasurementSet: "not-an-array",
    });

    const request = new FetchRequest();
    const newConfig = ["lab.title"];

    await saveOptionalFacetsConfigForType(
      "MeasurementSet",
      newConfig,
      request,
      false
    );

    expect(setItemSpy).toHaveBeenCalledWith(
      "facet-optional",
      JSON.stringify({
        MeasurementSet: ["lab.title"],
      })
    );
  });

  it("should handle localStorage.setItem throwing an error", async () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // Make setItem throw an error (e.g., quota exceeded)
    setItemSpy.mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const request = new FetchRequest();
    const newConfig = ["lab.title"];

    await saveOptionalFacetsConfigForType(
      "MeasurementSet",
      newConfig,
      request,
      false
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to save to localStorage:",
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });
});
