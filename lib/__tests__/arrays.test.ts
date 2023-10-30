import {
  CountedString,
  countedStringsToStringsWithCounts,
  stringsToCountedStrings,
  stringsToStringsWithCounts,
} from "../arrays";

describe("Test countedStringsToStringsWithCounts utility", () => {
  it("should convert counted strings to strings with counts", () => {
    const countedStrings: CountedString[] = [
      { a: 2 },
      { A: 1 },
      { b: 2 },
      { c: 1 },
    ];
    const stringsWithCounts = countedStringsToStringsWithCounts(countedStrings);
    expect(stringsWithCounts).toEqual(["a (2)", "A", "b (2)", "c"]);
  });

  it("should handle an empty array", () => {
    const countedStrings: CountedString[] = [];
    const stringsWithCounts = countedStringsToStringsWithCounts(countedStrings);
    expect(stringsWithCounts).toEqual([]);
  });

  it("should handle an array with one element", () => {
    const countedStrings: CountedString[] = [{ a: 1 }];
    const stringsWithCounts = countedStringsToStringsWithCounts(countedStrings);
    expect(stringsWithCounts).toEqual(["a"]);
  });

  it("should handle an array with one element repeated", () => {
    const countedStrings: CountedString[] = [{ a: 6 }];
    const stringsWithCounts = countedStringsToStringsWithCounts(countedStrings);
    expect(stringsWithCounts).toEqual(["a (6)"]);
  });
});

describe("Test stringsToCountedStrings utility", () => {
  it("should group string arrays and sort them", () => {
    const strings = ["b", "c", "a", "C", "a", "c", "A", "b", "b"];
    const grouped = stringsToCountedStrings(strings);
    expect(grouped).toEqual([{ a: 2 }, { A: 1 }, { b: 3 }, { c: 2 }, { C: 1 }]);
  });

  it("should handle an empty array", () => {
    const strings: string[] = [];
    const grouped = stringsToCountedStrings(strings);
    expect(grouped).toEqual([]);
  });

  it("should handle an array with one element", () => {
    const strings = ["a"];
    const grouped = stringsToCountedStrings(strings);
    expect(grouped).toEqual([{ a: 1 }]);
  });

  it("should handle an array with one element repeated", () => {
    const strings = ["a", "a", "a", "a", "a", "a"];
    const grouped = stringsToCountedStrings(strings);
    expect(grouped).toEqual([{ a: 6 }]);
  });
});

describe("Test stringsToStringsWithCounts utility", () => {
  it("should convert strings to strings with counts", () => {
    const strings = ["b", "c", "a", "C", "a", "c", "A", "b", "b"];
    const stringsWithCounts = stringsToStringsWithCounts(strings);
    expect(stringsWithCounts).toEqual(["a (2)", "A", "b (3)", "c (2)", "C"]);
  });

  it("should handle an empty array", () => {
    const strings: string[] = [];
    const stringsWithCounts = stringsToStringsWithCounts(strings);
    expect(stringsWithCounts).toEqual([]);
  });

  it("should handle an array with one element", () => {
    const strings = ["a"];
    const stringsWithCounts = stringsToStringsWithCounts(strings);
    expect(stringsWithCounts).toEqual(["a"]);
  });

  it("should handle an array with one element repeated", () => {
    const strings = ["a", "a", "a", "a", "a", "a"];
    const stringsWithCounts = stringsToStringsWithCounts(strings);
    expect(stringsWithCounts).toEqual(["a (6)"]);
  });
});
