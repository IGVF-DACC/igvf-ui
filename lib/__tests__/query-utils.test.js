import {
  getQueryStringFromServerQuery,
  isJsonFormat,
  splitPathAndQueryString,
} from "../query-utils";

describe("Test the getQueryStringFromServerQuery utility function", () => {
  it("should return an empty string if no query parameters are provided", () => {
    expect(getQueryStringFromServerQuery({})).toEqual("");
  });

  it("should return a query string with a single key-value pair", () => {
    expect(getQueryStringFromServerQuery({ a: "1" })).toEqual("a=1");
  });

  it("should return a query string with multiple key-value pairs", () => {
    expect(getQueryStringFromServerQuery({ a: "1", b: "2", c: "3" })).toEqual(
      "a=1&b=2&c=3"
    );
  });

  it("should return a query string with multiple key-value pairs with repeated keys", () => {
    expect(
      getQueryStringFromServerQuery({ a: "1", b: ["2", "3"], c: "4" })
    ).toEqual("a=1&b=2&b=3&c=4");
  });

  it("should return a deduplicated query string with multiple repeated key-value pairs", () => {
    expect(
      getQueryStringFromServerQuery({ a: "1", b: ["2", "2"], c: "3" })
    ).toEqual("a=1&b=2&c=3");
  });
});

describe("Test the splitPathAndQueryString utility function", () => {
  it("should return an empty query string if the URL has no query string", () => {
    expect(splitPathAndQueryString("https://example.com/path")).toEqual({
      path: "https://example.com/path",
      queryString: "",
    });
  });

  it("should return an empty query string if the relative URI has no query string", () => {
    expect(splitPathAndQueryString("/parent/path")).toEqual({
      path: "/parent/path",
      queryString: "",
    });
  });

  it("should return the correct query string for a URL", () => {
    expect(
      splitPathAndQueryString(
        "https://example.com/path?key0=value0&key1=value1"
      )
    ).toEqual({
      path: "https://example.com/path",
      queryString: "key0=value0&key1=value1",
    });
  });

  it("should return the correct query string for a relative URI", () => {
    expect(
      splitPathAndQueryString("/parent/path?key0=value0&key1=value1")
    ).toEqual({
      path: "/parent/path",
      queryString: "key0=value0&key1=value1",
    });
  });
});

describe("Test the isJsonFormat utility function", () => {
  it("should return whether the format is JSON", () => {
    expect(isJsonFormat({ format: "json" })).toEqual(true);
    expect(isJsonFormat({})).toEqual(false);
    expect(isJsonFormat({ type: "Gene" })).toEqual(false);
  });
});
