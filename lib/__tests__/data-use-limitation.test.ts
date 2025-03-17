import { decomposeDataUseLimitationSummary } from "../data-use-limitation";

describe("Test decomposeDataUseLimitationSummary", () => {
  it("should return a limitation but no modifier with a summary that has a limitation but no modifier", () => {
    const { limitation, modifiers } = decomposeDataUseLimitationSummary("DS");
    expect(limitation).toBe("DS");
    expect(modifiers).toEqual([]);
  });

  it("should return a limitation and a modifier with a summary that has a limitation and a modifier", () => {
    const { limitation, modifiers } =
      decomposeDataUseLimitationSummary("HMB-GSO,COL");
    expect(limitation).toBe("HMB");
    expect(modifiers).toEqual(["GSO", "COL"]);
  });

  it("should return an empty limitation and an empty modifier array with no summary", () => {
    const { limitation, modifiers } = decomposeDataUseLimitationSummary();
    expect(limitation).toBe("");
    expect(modifiers).toEqual([]);
  });
});
