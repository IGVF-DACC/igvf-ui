import { isPath, isPathArray, isEmbedded, isEmbeddedArray } from "../types";

describe("LinkTo type guards", () => {
  describe("isPath", () => {
    it("should return true for string values", () => {
      expect(isPath("http://example.com")).toBe(true);
    });

    it("should return false for non-string values", () => {
      expect(isPath({})).toBe(false);
      expect(isPath([])).toBe(false);
      expect(isPath(123)).toBe(false);
      expect(isPath(null)).toBe(false);
      expect(isPath(undefined)).toBe(false);
    });
  });

  describe("isPathArray", () => {
    it("should return true for arrays of strings", () => {
      expect(
        isPathArray([
          "/prediction-set/IGVFDS0000AAAA/",
          "/prediction-set/IGVFDS0001AAAA/",
        ])
      ).toBe(true);
    });

    it("should return false for non-array values", () => {
      expect(
        isPathArray("/prediction-set/IGVFDS0000AAAA/" as unknown as [])
      ).toBe(false);
      expect(isPathArray({} as unknown as [])).toBe(false);
      expect(isPathArray(123 as unknown as [])).toBe(false);
      expect(isPathArray(null)).toBe(false);
      expect(isPathArray(undefined)).toBe(false);
    });

    it("should return false for arrays with non-string elements", () => {
      expect(isPathArray(["/prediction-set/IGVFDS0000AAAA/", 123])).toBe(false);
      expect(isPathArray(["/prediction-set/IGVFDS0000AAAA/", {}])).toBe(false);
      expect(isPathArray(["/prediction-set/IGVFDS0000AAAA/", null])).toBe(
        false
      );
      expect(isPathArray(["/prediction-set/IGVFDS0000AAAA/", undefined])).toBe(
        false
      );
    });
  });

  describe("isEmbedded", () => {
    it("should return true for object values", () => {
      expect(isEmbedded({ name: "Example" })).toBe(true);
    });

    it("should return false for non-object values", () => {
      expect(isEmbedded("/prediction-set/IGVFDS0000AAAA/")).toBe(false);
      expect(isEmbedded([])).toBe(false);
      expect(isEmbedded(123)).toBe(false);
      expect(isEmbedded(null)).toBe(false);
      expect(isEmbedded(undefined)).toBe(false);
    });
  });

  describe("isEmbeddedArray", () => {
    it("should return true for arrays of objects", () => {
      expect(isEmbeddedArray([{ name: "Example" }, { name: "Another" }])).toBe(
        true
      );
    });

    it("should return false for non-array values", () => {
      expect(isEmbeddedArray({ name: "Example" } as unknown as [])).toBe(false);
      expect(
        isEmbeddedArray("/prediction-set/IGVFDS0000AAAA/" as unknown as [])
      ).toBe(false);
      expect(isEmbeddedArray(123 as unknown as [])).toBe(false);
      expect(isEmbeddedArray(null)).toBe(false);
      expect(isEmbeddedArray(undefined)).toBe(false);
    });

    it("should return false for arrays with non-object elements", () => {
      expect(isEmbeddedArray([{ name: "Example" }, 123])).toBe(false);
      expect(
        isEmbeddedArray([{ name: "Example" }, "/prediction-set/IGVFDS0000AAAA"])
      ).toBe(false);
      expect(isEmbeddedArray([{ name: "Example" }, null])).toBe(false);
      expect(isEmbeddedArray([{ name: "Example" }, undefined])).toBe(false);
    });
  });
});
