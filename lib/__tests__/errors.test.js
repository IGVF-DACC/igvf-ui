import { logError, errorObjectToProps } from "../errors";

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
    const errorObject = {
      code: 404,
    };
    const expected = {
      notFound: true,
    };
    const actual = errorObjectToProps(errorObject);
    expect(actual).toEqual(expected);
  });

  it("should return props for all other errors", () => {
    const errorObject = {
      code: 403,
    };
    const expected = {
      props: {
        serverSideError: {
          code: 403,
        },
      },
    };
    const actual = errorObjectToProps(errorObject);
    expect(actual).toEqual(expected);
  });
});
