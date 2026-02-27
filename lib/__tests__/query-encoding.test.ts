import { encodeUriElement, decodeUriElement } from "../query-encoding";

describe("Test that all character encoding/decoding substitution happens", () => {
  it("should transform parens, colons, and spaces in a query-string element", () => {
    expect(encodeUriElement("Human (Homo sapiens)")).toBe(
      "Human+%28Homo+sapiens%29"
    );
    expect(encodeUriElement("IGVF:02125")).toBe("IGVF:02125");
  });

  it("should decode a query-string element", () => {
    expect(decodeUriElement("Human+%28Homo+sapiens%29")).toBe(
      "Human (Homo sapiens)"
    );
    expect(decodeUriElement("IGVF:02125")).toBe("IGVF:02125");
  });
});
