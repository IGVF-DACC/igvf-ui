import { UC } from "../constants";
import { formatDateRange } from "../dates";

describe("Date-range formatter", () => {
  it("should return a formatted date range", () => {
    const actual = formatDateRange("2020-01-01", "2020-01-31");
    expect(actual).toBe(
      `January${UC.nbsp}1,${UC.nbsp}2020${UC.nbsp}–${UC.nbsp}January${UC.nbsp}31,${UC.nbsp}2020`
    );
  });

  it("should return one date if only the start date provided", () => {
    const actual = formatDateRange("2024-02-29");
    expect(actual).toBe(`February${UC.nbsp}29,${UC.nbsp}2024`);
  });

  it("should return one date if only the end date provided", () => {
    const actual = formatDateRange(undefined, "2021-12-31");
    expect(actual).toBe(`December${UC.nbsp}31,${UC.nbsp}2021`);
  });
});
