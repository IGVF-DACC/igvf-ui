import { formatDateRange } from "../dates";

describe("Date-range formatter", () => {
  it("should return a formatted date range", () => {
    const actual = formatDateRange("2020-01-01", "2020-01-31");
    expect(actual).toBe("January 1, 2020 – January 31, 2020");
  });

  it("should return one date if only the start date provided", () => {
    const actual = formatDateRange("2024-02-29");
    expect(actual).toBe("February 29, 2024");
  });

  it("should return one date if only the end date provided", () => {
    const actual = formatDateRange(undefined, "2021-12-31");
    expect(actual).toBe("December 31, 2021");
  });
});
