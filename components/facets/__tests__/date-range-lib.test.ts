import * as dateFns from "date-fns";
import {
  extractDateFromFilterTerm,
  getFacetDateRange,
  getFilterDateRange,
} from "../custom-facets/date-range-lib";
import { SearchResultsFacet, SearchResultsFilter } from "../../../globals";

describe("Test extractDateFromFilterTerm function", () => {
  it("should extract the date from a gte term in ISO 8601 format", () => {
    const term = "gte:2023-01-01T00:00:00.000Z";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2023-01-01");
  });

  it("should extract the date from a lte term in ISO 8601 format", () => {
    const term = "lte:2023-12-31T23:59:59.999Z";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2023-12-31");
  });

  it('should extract the date from a gte term in the format "YYYY-MM-DD"', () => {
    const term = "gte:2023-06-15";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2023-06-15");
  });

  it("should extract the date from a lte term in the format 'YYYY-MM-DD'", () => {
    const term = "lte:2023-06-15";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2023-06-15");
  });

  it("should extract the date from a gt term and adjust it one day later", () => {
    const term = "gt:2023-01-01";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2023-01-02");
  });

  it("should extract the date from a lt term and adjust it one day earlier", () => {
    const term = "lt:2023-01-01";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2022-12-31");
  });

  it("should extract the date from a gt term in ISO 8601 format", () => {
    const term = "gt:2023-01-01T00:00:00.000Z";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2023-01-02");
  });

  it("should extract the date from a lt term in ISO 8601 format", () => {
    const term = "lt:2023-01-01T00:00:00.000Z";
    const date = extractDateFromFilterTerm(term);
    expect(date).toEqual("2022-12-31");
  });

  it("should return an empty string for an invalid term", () => {
    let term = "invalid-term";
    let date = extractDateFromFilterTerm(term);
    expect(date).toEqual("");

    term = "gte:invalid-date";
    date = extractDateFromFilterTerm(term);
    expect(date).toEqual("");

    term = "lt:invalid-date";
    date = extractDateFromFilterTerm(term);
    expect(date).toEqual("");
  });
});

describe("Test getFacetDateRange function", () => {
  it("should return the earliest and latest dates from the facet terms", () => {
    const facet: SearchResultsFacet = {
      field: "date",
      title: "Dates",
      type: "date",
      terms: [
        {
          key_as_string: "2023-03-23T12:34:56.000Z",
          key: 1672537600000,
          doc_count: 10,
        },
        {
          key_as_string: "2023-01-01T11:35:55.000Z",
          key: 1672537600000,
          doc_count: 10,
        },
        {
          key_as_string: "2023-12-31T14:03:15.000Z",
          key: 1704067200000,
          doc_count: 5,
        },
        {
          key_as_string: "2023-06-15T18:48:03.000Z",
          key: 1686787200000,
          doc_count: 8,
        },
      ],
    };

    const [earliest, latest] = getFacetDateRange(facet);

    expect(earliest.getTime()).toBe(dateFns.parseISO("2023-01-01").getTime());
    expect(latest.getTime()).toBe(dateFns.parseISO("2023-12-31").getTime());
  });

  it("should handle an empty facet terms array", () => {
    const facet: SearchResultsFacet = {
      field: "date",
      title: "Dates",
      type: "date",
      terms: [],
    };

    const [earliest, latest] = getFacetDateRange(facet);
    expect(earliest).toBeNull();
    expect(latest).toBeNull();
  });
});

describe("Test getFilterDateRange function", () => {
  it("should return the earliest and latest dates from the filters", () => {
    const filters: SearchResultsFilter[] = [
      {
        field: "release_timestamp",
        term: "gte:2023-01-01T00:00:00.000Z",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "lte:2023-12-31T23:59:59.999Z",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "gte:2023-06-01T00:00:00.000Z",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "lte:2023-12-30T11:13:43.999Z",
        remove: "",
      },
    ];

    const [earliest, latest] = getFilterDateRange("release_timestamp", filters);

    expect(earliest.getTime()).toBe(dateFns.parseISO("2023-06-01").getTime());
    expect(latest.getTime()).toBe(dateFns.parseISO("2023-12-30").getTime());
  });

  it("should return the earliest dates from a mix of gte and gt filters", () => {
    const filters: SearchResultsFilter[] = [
      {
        field: "release_timestamp",
        term: "gte:2023-01-01",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "gt:2023-06-01",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "gte:2023-06-01",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "gt:2023-03-23",
        remove: "",
      },
    ];
    const [earliest, latest] = getFilterDateRange("release_timestamp", filters);
    expect(earliest.getTime()).toBe(dateFns.parseISO("2023-06-02").getTime());
    expect(latest).toBeNull();
  });

  it("should return the latest dates from a mix of lte and lt filters", () => {
    const filters: SearchResultsFilter[] = [
      {
        field: "release_timestamp",
        term: "lte:2023-12-31",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "lt:2023-06-01",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "lte:2023-06-01",
        remove: "",
      },
      {
        field: "release_timestamp",
        term: "lt:2023-08-23",
        remove: "",
      },
    ];
    const [earliest, latest] = getFilterDateRange("release_timestamp", filters);
    expect(earliest).toBeNull();
    expect(latest.getTime()).toBe(dateFns.parseISO("2023-05-31").getTime());
  });

  it("should return the same date for both earliest and latest if a single date filter is provided", () => {
    const filters: SearchResultsFilter[] = [
      {
        field: "release_timestamp",
        term: "2023-06-01T00:00:00.000Z",
        remove: "",
      },
    ];
    const [earliest, latest] = getFilterDateRange("release_timestamp", filters);
    expect(earliest.getTime()).toBe(dateFns.parseISO("2023-06-01").getTime());
    expect(latest.getTime()).toBe(dateFns.parseISO("2023-06-01").getTime());
  });

  it("should return null for both earliest and latest if a wildcard filter is provided", () => {
    const filters: SearchResultsFilter[] = [
      {
        field: "release_timestamp",
        term: "*",
        remove: "",
      },
    ];
    const [earliest, latest] = getFilterDateRange("release_timestamp", filters);
    expect(earliest).toBeNull();
    expect(latest).toBeNull();
  });

  it("should handle no filters for the given field", () => {
    const field = "date";
    const filters = [
      { field: "otherField", term: "gte:2023-06-01T00:00:00.000Z", remove: "" },
    ];

    const [earliest, latest] = getFilterDateRange(field, filters);

    expect(earliest).toBeNull();
    expect(latest).toBeNull();
  });
});
