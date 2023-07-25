import { jsonString } from "../key-parser";

describe("Test JSON parser", () => {
  it("should parse json strings", () => {
    const p = jsonString.parse('"hello"').value;
    expect(p).toBe("hello");
  });
});
