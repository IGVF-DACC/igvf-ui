import { ErrorObject } from "../fetch-request.d";
import { generateErrorObject, errorObjectToProps, logError } from "../errors";

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
      description,
      detail,
      status: statusCode.toString(),
      title,
    };
    const actual = generateErrorObject(statusCode, title, description, detail);
    expect(actual).toEqual(expected);
  });
});
