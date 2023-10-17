import { getFilterTerm, getVisibleFacets } from "../facets";

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
    ];
    const expected = [
      { field: "foo", count: 1 },
      { field: "bar", count: 1 },
    ];
    expect(getVisibleFacets(facets)).toEqual(expected);
  });
});
