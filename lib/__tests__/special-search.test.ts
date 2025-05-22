import { idSearchPath, siteSearchPath } from "../special-search";
import { encodeUriElement } from "../query-encoding";

describe("Test idSearchPath()", () => {
  it("should return the correct path for a given search term", () => {
    const searchTerm = "IGVFDS0000AAAA";
    const expectedPath = `/id-search?id=${encodeUriElement(searchTerm)}`;
    expect(idSearchPath(searchTerm)).toBe(expectedPath);
  });

  it("should handle special characters in the search term", () => {
    const searchTerm = "j-michael-cherry:AA F donor of fibroblasts";
    const expectedPath = `/id-search?id=${encodeUriElement(searchTerm)}`;
    expect(idSearchPath(searchTerm)).toBe(expectedPath);
  });
});

describe("Test siteSearchPath()", () => {
  it("should return the correct path for a given search term", () => {
    const searchTerm = "test";
    const expectedPath = `/site-search/?query=${encodeUriElement(searchTerm)}`;
    expect(siteSearchPath(searchTerm)).toBe(expectedPath);
  });

  it("should handle special characters in the search term", () => {
    const searchTerm = "test~test";
    const expectedPath = `/site-search/?query=${encodeUriElement(searchTerm)}`;
    expect(siteSearchPath(searchTerm)).toBe(expectedPath);
  });
});
