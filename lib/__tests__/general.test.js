import {
  toShishkebabCase,
  isValidUrl,
  pathToType,
  removeTrailingSlash,
  sortedJson,
  urlWithoutParams,
  truncateJson,
} from "../general";

describe("Test the pathToType utility function", () => {
  it("should return the type that the given path indicates; or the empty string", () => {
    expect(
      pathToType("/primary-cells/578c72a2-4f84-2c8f-96b0-ec8715e18185/")
    ).toBe("primary-cells");
    expect(pathToType("/labs/j-michael-cherry/")).toBe("labs");
    expect(pathToType("j-michael-cherry/")).toBe("");
  });
});

describe("Test the isValidUrl utility function", () => {
  it("should return true if the given string is a valid URL", () => {
    expect(isValidUrl("https://github.com")).toBe(true);
    expect(isValidUrl("http://github.com")).toBe(true);
    expect(isValidUrl("www.github.com")).toBe(false);
    expect(isValidUrl("github.com")).toBe(false);
  });
});

describe("Test the urlWithoutParams utility function", () => {
  it("should return the given url or path without the query string", () => {
    expect(urlWithoutParams("https://github.com")).toBe("https://github.com");
    expect(urlWithoutParams("https://github.com?key=value")).toBe(
      "https://github.com"
    );
    expect(urlWithoutParams("/labs/j-michael-cherry/")).toBe(
      "/labs/j-michael-cherry/"
    );
    expect(urlWithoutParams("/labs/j-michael-cherry/?key=value")).toBe(
      "/labs/j-michael-cherry/"
    );
  });
});

describe("Test the sortedJson utility function", () => {
  it("Should sort a json object's keys", () => {
    expect(sortedJson({ z: 1, a: 5 })).toStrictEqual({ a: 5, z: 1 });
  });
  it("It should sort an array object", () => {
    expect(sortedJson(["zebra", "apple"])).toStrictEqual(["apple", "zebra"]);
  });
});

describe("Test the toShishkebabCase utility function", () => {
  it("Should convert a string to shishkebab case", () => {
    expect(toShishkebabCase("Hello World")).toBe("hello-world");
    expect(toShishkebabCase("Hello-World")).toBe("hello-world");
    expect(toShishkebabCase("Hello_World")).toBe("hello-world");
    expect(toShishkebabCase("-Hello-World-")).toBe("hello-world");
  });
});

describe("Test the removeTrailingSlash utility function", () => {
  it("Should remove a trailing slash from a string", () => {
    expect(removeTrailingSlash("/path/object/")).toBe("/path/object");
    expect(removeTrailingSlash("/path/object")).toBe("/path/object");
  });
});

describe("Test the truncateJson utility function", () => {
  it("doesn't truncate a JSON object that's shorter than 200 characters", () => {
    const obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      c: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      d: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      e: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      f: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      g: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const truncated = truncateJson(obj);
    expect(truncated).toStrictEqual(
      `{"a":[1,2,3,4,5,6,7,8,9,10],"b":[1,2,3,4,5,6,7,8,9,10],"c":[1,2,3,4,5,6,7,8,9,10],"d":[1,2,3,4,5,6,7,8,9,10],"e":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3,4,5,6,7,8,9,10],"g":[1,2,3,4,5,6,7,8,9,10]}`
    );
  });

  it("truncates a JSON object that's longer than 200 characters", () => {
    const obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      c: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      d: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      e: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      f: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      g: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const truncated = truncateJson(obj);
    expect(truncated).toStrictEqual(
      `{"a":[1,2,3,4,5,6,7,8,9,10],"b":[1,2,3,4,5,6,7,8,9,10],"c":[1,2,3,4,5,6,7,8,9,10],"d":[1,2,3,4,5,6,7,8,9,10],"e":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3,4,5,6,7,8,9,10],"g":[1,2,3,4,5,6,7,8,9,10],"h":[1,2,3...`
    );
  });

  it("doesn't truncate a JSON object that's shorter than a specified number of characters", () => {
    const obj = {
      a: [1, 2],
    };
    const truncated = truncateJson(obj, 20);
    expect(truncated).toStrictEqual(`{"a":[1,2]}`);
  });

  it("truncates a JSON object that's longer than a specified number of characters", () => {
    const obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const truncated = truncateJson(obj, 20);
    expect(truncated).toStrictEqual(`{"a":[1,2,3,4,5,6,7,...`);
  });
});
