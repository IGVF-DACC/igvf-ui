import { isValidUrl, pathToType, urlWithoutParams } from "../general";

describe("Test the pathToType utility function", () => {
  it("should return the type that the given path indicates; or the empty string", () => {
    expect(
      pathToType("/cell-lines/467c72a2-4f84-2c8f-96b0-ec8715e18185/")
    ).toBe("cell-lines");
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
