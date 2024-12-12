import {
  generateSearchResultsTypes,
  getSpecificSearchTypes,
  stripLimitQueryIfNeeded,
} from "../search-results";
import { CollectionTitles, Profiles, SearchResults } from "../../globals.d";
import _ from "lodash";

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
    const searchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      facets: [],
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
    const collectionTitles: CollectionTitles = {
      "@type": ["CollectionTitles"],
      "measurement-sets": "Measurement Sets",
      MeasurementSet: "Measurement Sets",
      measurement_set: "Measurement Sets",
      "in-vitro-systems": "In Vitro Systems",
      InVitroSystem: "In Vitro Systems",
      in_vitro_system: "In Vitro Systems",
    };
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

describe("Test getSpecificSearchTypes()", () => {
  it("returns an empty array if the search result filters contain no types", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      facets: [],
      filters: [
        {
          field: "status",
          term: "released",
          remove: "/search/",
        },
      ],
      notification: "Success",
      title: "Search Results",
      total: 0,
    };
    expect(getSpecificSearchTypes(searchResults)).toEqual([]);
  });

  it("returns an array of types from the search result filters", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/search/?type=Item",
      "@type": ["SearchResults"],
      clear_filters: "/search/",
      columns: {},
      facets: [],
      filters: [
        {
          field: "type",
          term: "Item",
          remove: "/search/",
        },
        {
          field: "type",
          term: "Dataset",
          remove: "/search/",
        },
        {
          field: "status",
          term: "released",
          remove: "/search/",
        },
      ],
      notification: "Success",
      title: "Search Results",
      total: 0,
    };
    expect(getSpecificSearchTypes(searchResults)).toEqual(["Item", "Dataset"]);
  });
});
