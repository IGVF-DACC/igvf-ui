import {
  checkHierarchicalFacet,
  collectAllChildFacets,
  filterOutChildFacets,
  generateFacetStoreKey,
  getFacetConfig,
  getFilterTerm,
  getTermSelections,
  getVisibleFacets,
  getVisibleFilters,
  setFacetConfig,
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
        total: 1,
      },
      {
        field: "bar",
        title: "Bar",
        terms: [{ key: "two", doc_count: 1 }],
        total: 1,
      },
      {
        field: "audit.INTERNAL_ACTION.category",
        title: "Audit category: DCC ACTION",
        terms: [{ key: "mismatched status", doc_count: 1 }],
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
        total: 1,
      },
      {
        field: "bar",
        title: "Bar",
        terms: [{ key: "two", doc_count: 1 }],
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
        total: 1,
      },
      {
        field: "bar",
        title: "Bar",
        terms: [{ key: "two", doc_count: 1 }],
        total: 1,
      },
      {
        field: "audit.INTERNAL_ACTION.category",
        title: "Audit category: DCC ACTION",
        terms: [{ key: "mismatched status", doc_count: 1 }],
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
        total: 3,
        appended: false,
      },
    ];

    expect(filterOutChildFacets(facets)).toEqual(expectedResults);
  });
});

describe("Test the getTermSelections function", () => {
  it("should return only non-selected terms for a facet with no selections", () => {
    const facet = {
      field: "lab.title",
      title: "Lab",
      terms: [
        {
          key: "J Michael Cherry, Stanford",
          doc_count: 3,
        },
      ],
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
    const facet = {
      field: "lab.title",
      title: "Lab",
      terms: [
        {
          key: "J Michael Cherry, Stanford",
          doc_count: 3,
        },
      ],
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
    const facet = {
      field: "lab.title",
      title: "Lab",
      terms: [
        {
          key: "J Michael Cherry, Stanford",
          doc_count: 3,
        },
      ],
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
    const facet = {
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
});

describe("Test the generateFacetStoreKey function", () => {
  it("should generate a key for the user", () => {
    const uuid = "123";
    expect(generateFacetStoreKey(uuid)).toEqual("facet-config-123");
  });
});

describe("Test the getFacetConfig / setFacetConfig functions", () => {
  it("should get the facet configuration for the user and object type", () => {
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
    expect(getFacetConfig(uuid, selectedType, request)).resolves.toEqual(
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
  });
});
