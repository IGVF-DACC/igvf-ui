import { jsonLineDiff } from "../history";

describe("Test jsonLineDiff", () => {
  it("should return an empty array when comparing identical JSON strings", () => {
    const a = `{
  "a": 1,
  "b": 2
}`;
    const b = `{
  "a": 1,
  "b": 2
}`;

    expect(jsonLineDiff(a, b)).toEqual([]);
  });

  it("should return a single line number when comparing JSON strings with one line changed", () => {
    const a = `{
  "a": 1,
  "b": 2
}`;
    const b = `{
  "a": 1,
  "b": 8
}`;

    expect(jsonLineDiff(a, b)).toEqual([3]);
  });

  it("should return a single line number with one inserted line", () => {
    const a = `{
  "a": 1,
  "b": 2,
  "c": 3,
  "d": 4
}`;
    const b = `{
  "a": 1,
  "b": 2,
  "i": 9,
  "c": 3,
  "d": 4
}`;

    expect(jsonLineDiff(a, b)).toEqual([4]);
  });

  it("should return a single line number with one deleted line", () => {
    const a = `{
  "a": 1,
  "b": 2,
  "c": 3,
  "d": 4
}`;
    const b = `{
  "a": 1,
  "b": 2,
  "d": 4
}`;

    expect(jsonLineDiff(a, b)).toEqual([-4]);
  });

  it("should return multiple line number with insertion of a multiline object", () => {
    const a = `{
  "a": 1,
  "b": 2
}`;
    const b = `{
  "a": 1,
  "b": 2,
  "c": {
    "d": 4,
    "e": 5
  }
}`;

    expect(jsonLineDiff(a, b)).toEqual([4, 5, 6, 7]);
  });

  it("should return multiple line number with deletion of a multiline object", () => {
    const a = `{
  "a": 1,
  "b": 2,
  "c": {
    "d": 4,
    "e": 5
  }
}`;
    const b = `{
  "a": 1,
  "b": 2
}`;

    expect(jsonLineDiff(a, b)).toEqual([-4]);
  });
});
