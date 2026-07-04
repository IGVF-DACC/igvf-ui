import {
  generateSearchResultsTypes,
  isSearchResults,
  stripLimitQueryIfNeeded,
} from "../search-results";
import { CollectionTitles, Profiles, SearchResults } from "../../globals.d";

describe("Test generateSearchResultsTypes()", () => {
  it("returns an empty array if profiles is null", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      facets: [],
      filters: [],
      notification: "Success",
      title: "Search Results",
      total: 0,
    };
    const profiles = null;
    const collectionTitles = null;

    expect(
      generateSearchResultsTypes(searchResults, profiles, collectionTitles)
    ).toEqual([]);
  });

  it("returns an empty array if the type facet is not found", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      facets: [],
      filters: [],
      notification: "Success",
      title: "Search Results",
      total: 0,
    };
    const profiles: Profiles = {
      "@type": ["Profile"],
      _hierarchy: {
        Item: {},
      },
      _subtypes: {},
    };
    const collectionTitles = null;

    expect(
      generateSearchResultsTypes(searchResults, profiles, collectionTitles)
    ).toEqual([]);
  });

  it("returns an array of concrete types", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      notification: "Success",
      title: "Search Results",
      total: 0,
      filters: [],
      facets: [
        {
          field: "type",
          title: "Type",
          terms: [
            {
              key: "type1",
              doc_count: 1,
            },
            {
              key: "type2",
              doc_count: 1,
            },
          ],
          total: 2,
          type: "terms",
        },
      ],
    };
    const profiles = {
      "@type": ["Profile"],
      _hierarchy: {
        Item: {},
      },
      _subtypes: {
        type1: ["type1"],
        type2: ["type2"],
      },
    };
    const collectionTitles = null;
    expect(
      generateSearchResultsTypes(searchResults, profiles, collectionTitles)
    ).toEqual(["type1", "type2"]);
  });

  it("returns an array of concrete types with collection titles", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      notification: "Success",
      title: "Search Results",
      total: 0,
      filters: [],
      facets: [
        {
          field: "type",
          title: "Type",
          terms: [
            {
              key: "MeasurementSet",
              doc_count: 1,
            },
            {
              key: "InVitroSystem",
              doc_count: 1,
            },
            {
              key: "File",
              doc_count: 1,
            },
            {
              key: "Weird",
              doc_count: 1,
            },
          ],
          total: 2,
          type: "terms",
        },
      ],
    };
    const profiles = {
      "@type": ["Profile"],
      _hierarchy: {
        Item: {},
      },
      _subtypes: {
        InVitroSystem: ["InVitroSystem"],
        MeasurementSet: ["MeasurementSet"],
        File: ["MatrixFile", "ReferenceFile"],
        Weird: ["Strange"],
      },
    };
    const collectionTitles = {
      "@type": ["CollectionTitles"],
      "measurement-sets": "Measurement Sets",
      MeasurementSet: "Measurement Sets",
      measurement_set: "Measurement Sets",
      "in-vitro-systems": "In Vitro Systems",
      InVitroSystem: "In Vitro Systems",
      in_vitro_system: "In Vitro Systems",
    } as unknown as CollectionTitles;
    expect(
      generateSearchResultsTypes(searchResults, profiles, collectionTitles)
    ).toEqual(["In Vitro Systems", "Measurement Sets"]);
  });
});

describe("Test stripLimitQueryIfNeeded()", () => {
  it("returns an empty string if the limit query parameter is not present", () => {
    const query = {
      type: "Item",
    };
    expect(stripLimitQueryIfNeeded(query)).toEqual("");
  });

  it("returns an empty string if the limit query parameter is less than or equal to 1000", () => {
    const query = {
      type: "Item",
      limit: "1000",
    };
    expect(stripLimitQueryIfNeeded(query)).toEqual("");
  });

  it("returns a query string to remove the limit query parameter", () => {
    const query = {
      type: "Item",
      limit: "1001",
    };
    expect(stripLimitQueryIfNeeded(query)).toEqual("type=Item");
  });

  it("returns a query string to remove the limit query parameter if it contains multiple values", () => {
    const query = {
      type: "Item",
      limit: ["1001", "1002"],
    };
    expect(stripLimitQueryIfNeeded(query)).toEqual("type=Item");
  });
});

describe("isSearchResults()", () => {
  it("returns true for a valid SearchResults object", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["Search"],
      clear_filters: "/search/",
      columns: {},
      facets: [],
      filters: [],
      notification: "Success",
      title: "Search Results",
      total: 0,
    };
    expect(isSearchResults(searchResults)).toBe(true);
  });

  it("returns false for an object that is missing required properties", () => {
    const invalidObject = {
      "@context": "/terms/",
      "@graph": [],
    };
    expect(isSearchResults(invalidObject)).toBe(false);
  });

  it("returns false for a non-object value", () => {
    expect(isSearchResults("not an object")).toBe(false);
  });
});
