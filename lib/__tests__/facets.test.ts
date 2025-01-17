import {
  generateFacetStoreKey,
  getFacetConfig,
  getFilterTerm,
  getVisibleFacets,
  setFacetConfig,
} from "../facets";
import FetchRequest from "../fetch-request";

describe("Test the getFilterTerm function", () => {
  it("should return the term if it's not a wildcard", () => {
    const filter = { field: "type", term: "InVitroSystem" };
    expect(getFilterTerm(filter)).toEqual("InVitroSystem");
  });

  it("should return ANY if the term is *", () => {
    const filter = { field: "type", term: "*" };
    expect(getFilterTerm(filter)).toEqual("ANY");
  });

  it("should return NOT if the term is !*", () => {
    const filter = { field: "type!", term: "*" };
    expect(getFilterTerm(filter)).toEqual("NOT");
  });
});

describe("Test the getVisibleFacets function", () => {
  it("should filter out hidden facet fields", () => {
    const facets = [
      { field: "type", count: 1 },
      { field: "foo", count: 1 },
      { field: "bar", count: 1 },
      { field: "audit.INTERNAL_ACTION.category", count: 1 },
    ];
    const expectedSignedOut = [
      { field: "foo", count: 1 },
      { field: "bar", count: 1 },
    ];
    const expectedSignedIn = [
      { field: "foo", count: 1 },
      { field: "bar", count: 1 },
      { field: "audit.INTERNAL_ACTION.category", count: 1 },
    ];

    expect(getVisibleFacets(facets, false)).toEqual(expectedSignedOut);
    expect(getVisibleFacets(facets, true)).toEqual(expectedSignedIn);
  });
});

describe("Test the generateFacetStoreKey function", () => {
  it("should generate a key for the user", () => {
    const uuid = "123";
    expect(generateFacetStoreKey(uuid)).toEqual("facet-config-123");
  });
});

describe("Test the getFacetConfig / setFacetConfig functions", () => {
  it("should get the facet configuration for the user and object type", () => {
    const mockResult = { taxa: true };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const uuid = "123";
    const selectedType = "InVitroSystem";
    expect(getFacetConfig(uuid, selectedType, request)).resolves.toEqual(
      mockResult
    );
  });

  it("should save the facet configuration for the user and object type", () => {
    const mockResult = { taxa: true };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const uuid = "123";
    const selectedType = "InVitroSystem";
    const config = { taxa: true };
    setFacetConfig(uuid, selectedType, config, request);
  });
});
