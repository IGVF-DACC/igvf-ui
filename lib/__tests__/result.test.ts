import { Err, Ok, err, fromOption, ok } from "../result";

describe("Ok Result", () => {
  it("Ok isErr", () => {
    expect(ok("Foo").isErr()).toBe(false);
  });

  it("Ok isOk", () => {
    expect(ok("Foo").isOk()).toBe(true);
  });

  it("Ok map", () => {
    expect(
      ok("map")
        .map((s) => {
          return s.length;
        })
        .unwrap()
    ).toBe(3);
  });

  it("Ok map_async", async () => {
    expect(await ok("map").map_async(async (s) => s.length)).toStrictEqual(
      ok(3)
    );
  });

  it("Ok map_err", () => {
    expect(ok<string, null>("foo").map_err((_x) => 5)).toStrictEqual(ok("foo"));
  });

  it("Ok and_then", () => {
    // This maps Ok<string, unknown> to Result<number, null>
    // "map" has 3 letters so this should be Ok()
    expect(
      ok("map")
        .and_then((s) => {
          return s.length >= 3 ? ok(s[2].charCodeAt(0)) : err(null);
        })
        .unwrap()
    ).toBe(112);

    // "of" only has 2 letters, so we should get Err(null)
    expect(
      ok("of")
        .and_then((s) => {
          return s.length >= 3 ? ok(s[2].charCodeAt(0)) : err(null);
        })
        .unwrap_err()
    ).toBe(null);
  });

  it("Ok and_then_async", async () => {
    const x1 = await ok("map").and_then_async(async (s) => {
      const v = s.length >= 3 ? ok(s[2].charCodeAt(0)) : err(null);
      return v;
    });
    expect(x1).toStrictEqual(ok(112));

    const x2 = await ok("of").and_then_async(async (s) => {
      return s.length >= 3 ? ok(s[2].charCodeAt(0)) : err(null);
    });
    expect(x2).toStrictEqual(err(null));
  });

  it("Ok optional", () => {
    expect(ok<string, number>("foo").optional()).toBe("foo");
  });

  it("Ok union", () => {
    expect(ok<string, number>("foo").union()).toBe("foo");
  });

  it("Ok unwrap_err should throw", () => {
    expect(() => {
      ok("foo").unwrap_err();
    }).toThrow();
  });

  it("Ok unwrap_or should throw", () => {
    expect(ok("foo").unwrap_or("x")).toBe("foo");
  });

  it("Ok contained", () => {
    expect(ok("foo").contained()).toStrictEqual(ok("foo"));
  });

  it("Ok all should filter out Err and unwrap a list of results", () => {
    expect(Ok.all([ok(12), ok(14), err("hi")])).toStrictEqual([12, 14]);
  });
});

describe("Err Result", () => {
  it("Err isErr", () => {
    expect(err("Foo").isErr()).toBe(true);
  });

  it("Err isOk", () => {
    expect(err("Foo").isOk()).toBe(false);
  });

  it("Err map", () => {
    // The error type is propogated forward
    expect(
      err<string, null>(null)
        .map((s) => {
          return s.length;
        })
        .unwrap_err()
    ).toBe(null);
  });

  it("Err map_async", async () => {
    expect(
      await err<string, string>("error").map_async(async (s) => s.length)
    ).toStrictEqual(err("error"));
  });

  it("Err map_err", () => {
    // The error type is propogated forward and mapped using the function
    expect(
      err<string, string>("foo")
        .map_err((s) => {
          return s.length;
        })
        .unwrap_err()
    ).toBe(3);
  });

  it("Err unwrap", () => {
    expect(() => {
      err(null).unwrap();
    }).toThrow();
  });

  it("Err and_then", () => {
    // This maps Err<string, null> to Result<number, null>
    // The error type is propogated through the map operation
    expect(
      err<string, null>(null)
        .and_then((s) => {
          return s.length >= 3 ? ok(s[2].charCodeAt(0)) : err(null);
        })
        .unwrap_err()
    ).toBe(null);
  });

  it("Err and_then_async", async () => {
    const x = await err("foo").and_then_async(async (x) => ok(x));
    expect(x).toStrictEqual(err("foo"));
  });

  it("Err optional", () => {
    expect(err("foo").optional()).toBe(null);
  });

  it("Err union", () => {
    expect(err("foo").union()).toBe("foo");
  });

  it("Err unwrap_err should return the err", () => {
    expect(err("foo").unwrap_err()).toBe("foo");
  });

  it("Err unwrap_or should return the provided default value", () => {
    expect(err(null).unwrap_or("default")).toBe("default");
  });

  it("Err contained", () => {
    expect(err("foo").contained()).toStrictEqual(err("foo"));
  });

  it("Err all should filter out Ok and unwrap a list of results", () => {
    expect(Err.all([ok(12), ok(14), err("hi")])).toStrictEqual(["hi"]);
  });
});

describe("Test the utility functions", () => {
  it("test fromOption value", () => {
    expect(fromOption("foo")).toStrictEqual(ok("foo"));
  });

  it("test fromOption null or undefined", () => {
    expect(fromOption(null)).toStrictEqual(err(null));
    expect(fromOption(undefined)).toStrictEqual(err(null));
  });
});
