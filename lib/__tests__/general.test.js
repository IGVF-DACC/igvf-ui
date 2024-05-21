import {
  abbreviateNumber,
  dataSize,
  isValidPath,
  isValidUrl,
  itemId,
  nullOnError,
  pathToType,
  removeTrailingSlash,
  snakeCaseToHuman,
  snakeCaseToPascalCase,
  sortObjectProps,
  toShishkebabCase,
  truncateJson,
  truncateText,
  urlWithoutParams,
} from "../general";

describe("Test the pathToType utility function", () => {
  it("should return the type that the given path indicates; or the empty string", () => {
    expect(
      pathToType("/primary-cells/578c72a2-4f84-2c8f-96b0-ec8715e18185/")
    ).toBe("primary-cells");
    expect(pathToType("/labs/j-michael-cherry/")).toBe("labs");
    expect(pathToType("j-michael-cherry/")).toBe("");
  });
});

describe("Test the isValidPath utility function", () => {
  it("should return true if the given string is a valid path", () => {
    expect(isValidPath("/labs/j-michael-cherry/")).toBe(true);
    expect(isValidPath("/labs/j-michael-cherry")).toBe(true);
    expect(isValidPath("labs/j-michael-cherry/")).toBe(false);
    expect(isValidPath("labs/j-michael-cherry")).toBe(false);
  });
});

describe("Test the isValidUrl utility function", () => {
  it("should return true if the given string is a valid URL", () => {
    expect(isValidUrl("https://github.com")).toBe(true);
    expect(isValidUrl("http://github.com")).toBe(true);
    expect(isValidUrl("www.github.com")).toBe(false);
    expect(isValidUrl("github.com")).toBe(false);
  });
});

describe("Test the urlWithoutParams utility function", () => {
  it("should return the given url or path without the query string", () => {
    expect(urlWithoutParams("https://github.com")).toBe("https://github.com");
    expect(urlWithoutParams("https://github.com?key=value")).toBe(
      "https://github.com"
    );
    expect(urlWithoutParams("/labs/j-michael-cherry/")).toBe(
      "/labs/j-michael-cherry/"
    );
    expect(urlWithoutParams("/labs/j-michael-cherry/?key=value")).toBe(
      "/labs/j-michael-cherry/"
    );
  });
});

describe("Test the itemId utility function", () => {
  it("Should return the ID correctly", () => {
    expect(itemId("AnId")).toBe("AnId");
    expect(itemId({ "@id": "AnotherId" })).toBe("AnotherId");
  });
});

describe("Test the toShishkebabCase utility function", () => {
  it("Should convert a string to shishkebab case", () => {
    expect(toShishkebabCase("Hello World")).toBe("hello-world");
    expect(toShishkebabCase("Hello-World")).toBe("hello-world");
    expect(toShishkebabCase("Hello_World")).toBe("hello-world");
    expect(toShishkebabCase("-Hello-World-")).toBe("hello-world");
  });
});

describe("Test the removeTrailingSlash utility function", () => {
  it("Should remove a trailing slash from a string", () => {
    expect(removeTrailingSlash("/path/object/")).toBe("/path/object");
    expect(removeTrailingSlash("/path/object")).toBe("/path/object");
  });
});

describe("Test nullOnError utility", () => {
  it("should return null on error", () => {
    expect(nullOnError({ isError: true })).toBe(null);
  });
  it("should return the parameter when null or not an error", () => {
    expect(nullOnError(null)).toBe(null);
    expect(nullOnError("hello")).toStrictEqual("hello");
    expect(nullOnError({ hello: "world" })).toStrictEqual({ hello: "world" });
  });
});

describe("Test the truncateJson utility function", () => {
  it("doesn't truncate a JSON object that's shorter than 200 characters", () => {
    const obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      c: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      d: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      e: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      f: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      g: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const truncated = truncateJson(obj);
    expect(truncated).toStrictEqual(
      `{"a":[1,2,3,4,5,6,7,8,9,10],"b":[1,2,3,4,5,6,7,8,9,10],"c":[1,2,3,4,5,6,7,8,9,10],"d":[1,2,3,4,5,6,7,8,9,10],"e":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3,4,5,6,7,8,9,10],"g":[1,2,3,4,5,6,7,8,9,10]}`
    );
  });

  it("truncates a JSON object that's longer than 200 characters", () => {
    const obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      c: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      d: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      e: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      f: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      g: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const truncated = truncateJson(obj);
    expect(truncated).toStrictEqual(
      `{"a":[1,2,3,4,5,6,7,8,9,10],"b":[1,2,3,4,5,6,7,8,9,10],"c":[1,2,3,4,5,6,7,8,9,10],"d":[1,2,3,4,5,6,7,8,9,10],"e":[1,2,3,4,5,6,7,8,9,10],"f":[1,2,3,4,5,6,7,8,9,10],"g":[1,2,3,4,5,6,7,8,9,10],"h":[1,2,3...`
    );
  });

  it("doesn't truncate a JSON object that's shorter than a specified number of characters", () => {
    const obj = {
      a: [1, 2],
    };
    const truncated = truncateJson(obj, 20);
    expect(truncated).toStrictEqual(`{"a":[1,2]}`);
  });

  it("truncates a JSON object that's longer than a specified number of characters", () => {
    const obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const truncated = truncateJson(obj, 20);
    expect(truncated).toStrictEqual(`{"a":[1,2,3,4,5,6,7,...`);
  });
});

describe("Test the snakeCaseToHuman utility function", () => {
  it("Should convert a string to snakeCaseToHuman case", () => {
    expect(snakeCaseToHuman("Property_Name")).toBe("Property Name");
    expect(snakeCaseToHuman("PRoperty_NamE")).toBe("Property Name");
    expect(snakeCaseToHuman("_property_name_")).toBe("Property Name");
    expect(snakeCaseToHuman("property_name")).toBe("Property Name");
  });
});

describe("Test the snakeCaseToPascalCase utility function", () => {
  it("Should convert a string to snakeCaseToPascalCase case", () => {
    expect(snakeCaseToPascalCase("property_name")).toBe("PropertyName");
    expect(snakeCaseToPascalCase("_property_name_")).toBe("PropertyName");
  });
});

describe("Test the dataSize utility function", () => {
  it("Should convert a number to a human readable size", () => {
    expect(dataSize(0)).toBe("0 B");
    expect(dataSize(100)).toBe("100 B");
    expect(dataSize(1000)).toBe("1.0 KB");
    expect(dataSize(1500)).toBe("1.5 KB");
    expect(dataSize(65_000)).toBe("65 KB");
    expect(dataSize(65_536)).toBe("66 KB");
    expect(dataSize(1_000_000)).toBe("1.0 MB");
    expect(dataSize(2_500_000)).toBe("2.5 MB");
    expect(dataSize(270_000_000)).toBe("270 MB");
    expect(dataSize(1_000_000_000)).toBe("1.0 GB");
    expect(dataSize(8_500_000_000)).toBe("8.5 GB");
    expect(dataSize(1_000_000_000_000)).toBe("1.0 TB");
    expect(dataSize(560_000_000_000_000)).toBe("560 TB");
    expect(dataSize(1_000_000_000_000_000)).toBe("1.0 PB");
    expect(dataSize(512_000_000_000_000_000)).toBe("512 PB");
  });
});

describe("Test the abbreviateNumber function", () => {
  it("Should abbreviate a number correctly", () => {
    expect(abbreviateNumber(5)).toBe("5");
    expect(abbreviateNumber(1500)).toBe("1.5K");
    expect(abbreviateNumber(500_000)).toBe("500K");
    expect(abbreviateNumber(1_500_000)).toBe("1.5M");
    expect(abbreviateNumber(500_000_000)).toBe("500M");
    expect(abbreviateNumber(1_500_000_000)).toBe("1.5B");
    expect(abbreviateNumber(500_000_000_000)).toBe("500B");
  });
});

describe("Test the truncateText function", () => {
  it("Should truncate a string correctly", () => {
    expect(truncateText("Hello World", 8)).toBe("Hello…");
    expect(truncateText("Hello World", 11)).toBe("Hello World");
    expect(truncateText("Supercalifragilisticexpialidocious", 10)).toBe(
      "Supercalif…"
    );
  });
});

describe("Test the sortObjectProps function", () => {
  it("should sort a basic object's properties", () => {
    const obj = {
      z: 1,
      a: 5,
      c: 3,
      b: 2,
    };
    const expected = {
      a: 5,
      b: 2,
      c: 3,
      z: 1,
    };
    // Make sure the sorted obj and sorted return the properties in the same order.
    const sortedObj = sortObjectProps(obj);
    expect(JSON.stringify(sortedObj)).toEqual(JSON.stringify(expected));
  });

  it("should sort an object's properties as well as those of its nested objects", () => {
    const obj = {
      z: 1,
      a: 5,
      c: 3,
      b: 2,
      d: {
        z: 1,
        a: 5,
        c: 3,
        b: 2,
      },
    };
    const expected = {
      a: 5,
      b: 2,
      c: 3,
      d: {
        a: 5,
        b: 2,
        c: 3,
        z: 1,
      },
      z: 1,
    };
    const sortedObj = sortObjectProps(obj);
    expect(JSON.stringify(sortedObj)).toEqual(JSON.stringify(expected));
  });

  it("should sort an object's properties, but not sort an array", () => {
    const obj = {
      z: 1,
      a: 5,
      c: 3,
      b: 2,
      d: [1, 5, 3, 2, 4],
    };
    const expected = {
      a: 5,
      b: 2,
      c: 3,
      d: [1, 5, 3, 2, 4],
      z: 1,
    };
    const sortedObj = sortObjectProps(obj);
    expect(JSON.stringify(sortedObj)).toEqual(JSON.stringify(expected));
  });

  it("should sort an object's properties as well as those of the objects within an array", () => {
    const obj = {
      z: 1,
      a: 5,
      c: 3,
      b: 2,
      d: [
        {
          d: 1,
          a: 5,
          c: 3,
          b: 2,
        },
        {
          z: 1,
          w: 5,
          y: 3,
          x: 2,
        },
      ],
    };
    const expected = {
      a: 5,
      b: 2,
      c: 3,
      d: [
        {
          a: 5,
          b: 2,
          c: 3,
          d: 1,
        },
        {
          w: 5,
          x: 2,
          y: 3,
          z: 1,
        },
      ],
      z: 1,
    };
    const sortedObj = sortObjectProps(obj);
    expect(JSON.stringify(sortedObj)).toEqual(JSON.stringify(expected));
  });

  it("handles empty arrays, and ignores arrays of arrays of objects", () => {
    const obj = {
      b: [],
      a: [
        [
          { z: 2, a: 1 },
          { z: 4, a: 3 },
        ],
      ],
    };
    const expected = {
      a: [
        [
          { z: 2, a: 1 },
          { z: 4, a: 3 },
        ],
      ],
      b: [],
    };
    const sortedObj = sortObjectProps(obj);
    expect(JSON.stringify(sortedObj)).toEqual(JSON.stringify(expected));
  });
});
