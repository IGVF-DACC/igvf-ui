import { isHistoryObject, jsonLineDiff } from "../history";

describe("Test isHistoryObject", () => {
  it("should return true for an object with the required properties", () => {
    const obj = {
      rid: "/example/object",
      latest: {
        timestamp: "2024-01-01T00:00:00Z",
        userid: "user1",
        props: { key: "value" },
      },
      history: [
        {
          timestamp: "2023-12-31T23:00:00Z",
          userid: "user2",
          props: { key: "old value" },
        },
      ],
    };

    expect(isHistoryObject(obj)).toBe(true);
  });

  it("should return false for an object missing required properties", () => {
    const obj = {
      rid: "/example/object",
      latest: {
        timestamp: "2024-01-01T00:00:00Z",
        userid: "user1",
        props: { key: "value" },
      },
    };

    expect(isHistoryObject(obj)).toBe(false);
  });

  it("should return false for a non-object value", () => {
    const notAnObject = "This is a string, not an object";

    expect(isHistoryObject(notAnObject)).toBe(false);
  });
});

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
