import * as dateFns from "date-fns";
import {
  formatDate,
  formatDateApaStyle,
  formatDateRange,
  formatLongDate,
  iso8601ToDateOnly,
  stringToDate,
} from "../dates";
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

  it('should return a date and time if "show-time" is provided', () => {
    const actual = formatDate("2020-01-01", "show-time");
    expect(actual).toBe("January 1, 2020 00:00");
  });
});

describe("Test long date formatter", () => {
  it("should return a formatted long date", () => {
    const date = new Date("2020-01-01T00:00:00Z");
    const actual = formatLongDate(date);
    expect(actual).toBe("January 1, 2020");
  });

  it("should return a formatted long date with a different timezone", () => {
    const date = new Date("2020-01-01T00:00:00-05:00");
    const actual = formatLongDate(date);
    expect(actual).toBe("January 1, 2020");
  });
});

describe("Test APA date formatter", () => {
  it("should return a formatted date in APA style", () => {
    const actual = formatDateApaStyle("2020-01-01");
    expect(actual).toBe("(2020, January 1)");
  });

  it("should return a formatted date in APA style with a different timezone", () => {
    const actual = formatDateApaStyle("2020-01-01T00:00:00-05:00");
    expect(actual).toBe("(2020, January 1)");
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

describe("Test iso8601ToDateOnly", () => {
  it("should return a formatted date with a zero-padded month", () => {
    const actual = iso8601ToDateOnly("2023-08-01T04:12:31.890123+00:00");
    expect(actual).toBe("2023-08-01");
  });

  it("should return a formatted year and month for a two-digit month", () => {
    const actual = iso8601ToDateOnly("2023-12-01T04:12:31.890123+00:00");
    expect(actual).toBe("2023-12-01");
  });
});

describe("Test stringToDate", () => {
  it("should return a Date object representing the date string", () => {
    const dateString = "2023-08-01";
    const actual = stringToDate(dateString);
    expect(actual.getTime()).toBe(dateFns.parseISO("2023-08-01").getTime());
  });

  it("should return a Date object representing the date string with a different timezone", () => {
    const dateString = "2023-08-01T12:34:56.000Z";
    const actual = stringToDate(dateString);
    expect(actual.getTime()).toBe(dateFns.parseISO("2023-08-01").getTime());
  });
});
