import { ErrorObject } from "../fetch-request";
import {
  generateErrorObject,
  errorObjectToProps,
  isDataProviderErrorObject,
  logError,
} from "../errors";
import type { DataProviderObject } from "../../globals";

describe("Test logError", () => {
  it("should log an error", () => {
    const consoleSpy = jest.spyOn(console, "log");
    const dateSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2021-01-01T00:00:00.000Z");
    logError(403, "Forbidden");
    expect(consoleSpy).toHaveBeenCalledWith(
      "ERROR [2021-01-01T00:00:00.000Z] 403:Forbidden"
    );
    consoleSpy.mockRestore();
    dateSpy.mockRestore();
  });
});

describe("Test errorObjectToProps", () => {
  it("should return notFound for 404", () => {
    const errorObject: ErrorObject = {
      isError: true,
      "@type": ["Error"],
      code: 404,
      errors: [],
      description: "Not Found",
      detail: "The requested resource could not be found.",
      status: "404",
      title: "Not Found",
    };
    const expected = {
      notFound: true,
    };
    const actual = errorObjectToProps(errorObject);
    expect(actual).toEqual(expected);
  });

  it("should return props for all other errors", () => {
    const errorObject: ErrorObject = {
      isError: true,
      "@type": ["Error"],
      code: 403,
      errors: [],
      description: "Forbidden",
      detail: "You do not have permission to access this resource.",
      status: "403",
      title: "Forbidden",
    };
    const expected = {
      props: {
        serverSideError: {
          isError: true,
          "@type": ["Error"],
          code: 403,
          errors: [],
          description: "Forbidden",
          detail: "You do not have permission to access this resource.",
          status: "403",
          title: "Forbidden",
        },
      },
    };
    const actual = errorObjectToProps(errorObject);
    expect(actual).toEqual(expected);
  });
});

describe("Test generateErrorObject", () => {
  it("should generate an error object", () => {
    const statusCode = 403;
    const title = "Forbidden";
    const description = "You do not have permission to access this resource.";
    const detail = "This is a detailed error message.";
    const expected: ErrorObject = {
      isError: true,
      "@type": ["Error"],
      code: statusCode,
      errors: [],
      description,
      detail,
      status: statusCode.toString(),
      title,
    };
    const actual = generateErrorObject(statusCode, title, description, detail);
    expect(actual).toEqual(expected);
  });
});

describe("Test isDataProviderErrorObject", () => {
  it("should return true for a valid ErrorObject", () => {
    const errorObject: ErrorObject = {
      isError: true,
      "@type": ["Error"],
      code: 500,
      errors: [
        {
          description: "Invalid field",
          location: "body",
          name: ["field1", "field2"],
        },
      ],
      description: "Server error",
      detail: "An error occurred",
      status: "500",
      title: "Server Error",
    };
    expect(isDataProviderErrorObject(errorObject)).toBe(true);
  });

  it("should return false for a DataProviderObject without isError", () => {
    const dataObject: DataProviderObject = {
      "@id": "/some-object/",
      "@type": ["SomeType"],
      title: "Some Title",
    };
    expect(isDataProviderErrorObject(dataObject)).toBe(false);
  });

  it("should return false for a DataProviderObject with isError: false", () => {
    const dataObject: DataProviderObject = {
      "@id": "/some-object/",
      "@type": ["SomeType"],
      isError: false,
      errors: [],
    };
    expect(isDataProviderErrorObject(dataObject)).toBe(false);
  });

  it("should return false for an object with isError: true but no errors property", () => {
    const invalidObject = {
      isError: true,
      "@type": ["Error"],
      code: 500,
    };
    expect(isDataProviderErrorObject(invalidObject as any)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isDataProviderErrorObject(null as any)).toBeFalsy();
  });

  it("should return false for undefined", () => {
    expect(isDataProviderErrorObject(undefined as any)).toBeFalsy();
  });

  it("should return false for non-object types", () => {
    expect(isDataProviderErrorObject("error" as any)).toBe(false);
    expect(isDataProviderErrorObject(123 as any)).toBe(false);
    expect(isDataProviderErrorObject(true as any)).toBe(false);
  });

  it("should return true for ErrorObject with empty errors array", () => {
    const errorObject: ErrorObject = {
      isError: true,
      "@type": ["Error"],
      code: 404,
      errors: [],
      description: "Not found",
      detail: "Resource not found",
      status: "404",
      title: "Not Found",
    };
    expect(isDataProviderErrorObject(errorObject)).toBe(true);
  });
});
