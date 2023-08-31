import { colorToTriple, isLight } from "../color";

describe("Test colorToTriple()", () => {
  it("converts a hex color to an object with r, g, and b components", () => {
    const { r, g, b } = colorToTriple("#ff0000");
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});

describe("Test isLight()", () => {
  it("returns true for a light color", () => {
    expect(isLight("#ffffff")).toBe(true);
  });

  it("returns false for a dark color", () => {
    expect(isLight("#000000")).toBe(false);
  });
});
