import {
  getRangeQueryValues,
  scaleToInteger,
  scaleToOriginal,
} from "../custom-facets/stats-lib";
import QueryString from "../../../lib/query-string";

describe("Test the scaleToInteger function", () => {
  it("should return the original value if valueMode is 'integer'", () => {
    const originalValue = 5;
    const valueMode = "integer";
    const result = scaleToInteger(originalValue, valueMode);
    expect(result).toBe(originalValue);
  });

  it("should return the scaled value if valueMode is 'float'", () => {
    const originalValue = 5.1234;
    const valueMode = "float";
    const result = scaleToInteger(originalValue, valueMode);
    expect(result).toBe(512);
  });
});

describe("Test the scaleToOriginal function", () => {
  it("should return the original value if valueMode is 'integer'", () => {
    const scaledValue = 5;
    const valueMode = "integer";
    const result = scaleToOriginal(scaledValue, valueMode);
    expect(result).toBe(scaledValue);
  });

  it("should return the scaled value if valueMode is 'float'", () => {
    const scaledValue = 512;
    const valueMode = "float";
    const result = scaleToOriginal(scaledValue, valueMode);
    expect(result).toBe(5.12);
  });
});

describe("Test the getRangeQueryValues function", () => {
  it("should return the correct min and max values for integer value mode", () => {
    const query = new QueryString("type=File&file_size=gte:5&file_size=lte:10");
    const field = "file_size";
    const result = getRangeQueryValues(query, field);
    expect(result.minRangeQueryValue).toBe(5);
    expect(result.maxRangeQueryValue).toBe(10);
  });

  it("should return the correct min and max values for float value mode", () => {
    const query = new QueryString(
      "type=File&qc_metric=gte:5.1234&qc_metric=lte:10.5678"
    );
    const field = "qc_metric";
    const valueMode = "float";
    const result = getRangeQueryValues(query, field, valueMode);
    expect(result.minRangeQueryValue).toBe(512);
    expect(result.maxRangeQueryValue).toBe(1057);
  });

  it("should return null min value for missing min value", () => {
    const query = new QueryString("type=File&qc_metric=lte:10.5678");
    const field = "qc_metric";
    const valueMode = "float";
    const result = getRangeQueryValues(query, field, valueMode);
    expect(result.minRangeQueryValue).toBeNull();
    expect(result.maxRangeQueryValue).toBe(1057);
  });

  it("should return null max value for missing max value", () => {
    const query = new QueryString("type=File&qc_metric=gte:5");
    const field = "qc_metric";
    const valueMode = "integer";
    const result = getRangeQueryValues(query, field, valueMode);
    expect(result.minRangeQueryValue).toBe(5);
    expect(result.maxRangeQueryValue).toBeNull();
  });
});
