import { render, screen } from "@testing-library/react";
import DateRangeTagLabel from "../custom-facets/date-range-tag-label";
import type { SearchResultsFilter } from "../../../globals";

describe("Test DateRangeTagLabel component", () => {
  it("should render a date range tag label with gte", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp",
      term: "gte:1912-04-14",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/≥\s*April 14, 1912/)).toBeInTheDocument();
  });

  it("should render a date range tag label with lte", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp",
      term: "lte:1912-04-14",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/≤\s*April 14, 1912/)).toBeInTheDocument();
  });

  it("should render a date range tag label with gt", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp",
      term: "gt:1912-04-14",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/>\s*April 14, 1912/)).toBeInTheDocument();
  });

  it("should render a date range tag label with lt", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp",
      term: "lt:1912-04-14",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/<\s*April 14, 1912/)).toBeInTheDocument();
  });

  it("should render a date range tag label with *", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp",
      term: "*",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/Exists/)).toBeInTheDocument();
  });

  it("should render a date range tag label with !=*", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp!",
      term: "*",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/None/)).toBeInTheDocument();
  });

  it("should render a date range tag label with an invalid date", () => {
    const filter: SearchResultsFilter = {
      field: "release_timestamp",
      term: "invalid-date",
      remove: "/search/?type=MeasurementSet",
    };

    render(<DateRangeTagLabel filter={filter} />);
    expect(screen.getByText(/invalid-date/)).toBeInTheDocument();
  });
});
