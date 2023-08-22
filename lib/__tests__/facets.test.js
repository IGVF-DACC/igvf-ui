import { getVisibleFacets } from "../facets";

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
