import { formatDate, formatDateRange, iso8601ToYearDate } from "../dates";
import { UC } from "../constants";

describe("Date formatter", () => {
  it("should return a formatted date", () => {
    const actual = formatDate("2020-01-01");
    expect(actual).toBe("January 1, 2020");
  });

  it("should return an empty string if no date provided", () => {
    const actual = formatDate();
    expect(actual).toBe("");
  });
});

describe("Date-range formatter", () => {
  it("should return a formatted date range", () => {
    const actual = formatDateRange("2020-01-01", "2020-01-31");
    expect(actual).toBe(`January 1, 2020 ${UC.ndash} January 31, 2020`);
  });

  it("should return one date if only the start date provided", () => {
    const actual = formatDateRange("2024-02-29");
    expect(actual).toBe(`February 29, 2024`);
  });

  it("should return one date if only the end date provided", () => {
    const actual = formatDateRange(undefined, "2021-12-31");
    expect(actual).toBe(`December 31, 2021`);
  });
});

describe("Test iso8601ToYearDate", () => {
  it("should return a formatted date with a zero-padded month", () => {
    const actual = iso8601ToYearDate("2023-08-01T04:12:31.890123+00:00");
    expect(actual).toBe("2023-08");
  });

  it("should return a formatted year and month for a two-digit month", () => {
    const actual = iso8601ToYearDate("2023-12-01T04:12:31.890123+00:00");
    expect(actual).toBe("2023-12");
  });
});
