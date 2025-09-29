import {
  abbreviateNumber,
  arbitraryTypeToText,
  convertTextToTitleCase,
  dataSize,
  isObjectArrayProperty,
  isStringArrayProperty,
  isValidPath,
  isValidUrl,
  itemId,
  pathToId,
  pathToType,
  removeTrailingSlash,
  snakeCaseToHuman,
  snakeCaseToPascalCase,
  sortedSeparatedList,
  sortObjectProps,
  toShishkebabCase,
  truncateJson,
  truncateText,
  truthyOrZero,
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

describe("Test the pathToId utility function", () => {
  it("should return the ID that the given path indicates; or the empty string", () => {
    expect(
      pathToId("/primary-cells/578c72a2-4f84-2c8f-96b0-ec8715e18185/")
    ).toBe("578c72a2-4f84-2c8f-96b0-ec8715e18185");
    expect(pathToId("/labs/j-michael-cherry/")).toBe("j-michael-cherry");
    expect(pathToId("j-michael-cherry/")).toBe("");
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

describe("Test truthyOrZero utility function", () => {
  it("should return the value if it's truthy, or zero if it's falsy", () => {
    expect(truthyOrZero(1)).toBe(true);
    expect(truthyOrZero(0)).toBe(true);
    expect(truthyOrZero(null)).toBe(false);
    expect(truthyOrZero(undefined)).toBe(false);
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

describe("Test the sortedSeparatedList function", () => {
  it("should correctly sort an array of strings", () => {
    const arr = ["Banana", "apple", "cherry"];
    const expected = "apple, Banana, cherry";
    const sortedArr = sortedSeparatedList(arr);
    expect(sortedArr).toEqual(expected);
  });

  it("should correctly sort an array of numbers", () => {
    const arr = [3, 1, 2];
    const expected = "1, 2, 3";
    const sortedArr = sortedSeparatedList(arr);
    expect(sortedArr).toEqual(expected);
  });

  it("should correctly sort an array of mixed strings and numbers with custom separator", () => {
    const arr = ["Banana", 3, "apple", 1, "cherry", 2];
    const expected = "1 : 2 : 3 : apple : Banana : cherry";
    const sortedArr = sortedSeparatedList(arr, " : ");
    expect(sortedArr).toEqual(expected);
  });

  it("should return an empty string for an empty array", () => {
    const arr: string[] = [];
    let sortedArr = sortedSeparatedList(arr);
    expect(sortedArr).toBe("");

    sortedArr = sortedSeparatedList(arr, " : ");
    expect(sortedArr).toBe("");
  });

  it("should return an empty string for a non-array input", () => {
    const notAStringArray = "not an array";
    let sortedArr = sortedSeparatedList(notAStringArray as unknown as string[]);
    expect(sortedArr).toBe("");

    const notANumberArray = 12345;
    sortedArr = sortedSeparatedList(notANumberArray as unknown as number[]);
    expect(sortedArr).toBe("");
  });
});

describe("Test the convertTextToTitleCase function", () => {
  it("Should convert a string to title case", () => {
    expect(convertTextToTitleCase("hello world")).toBe("Hello World");
    expect(convertTextToTitleCase("hello World")).toBe("Hello World");
    expect(convertTextToTitleCase("hello-world")).toBe("Hello-world");
    expect(convertTextToTitleCase("hello_world")).toBe("Hello_world");
    expect(convertTextToTitleCase("helloworld")).toBe("Helloworld");
    expect(convertTextToTitleCase("")).toBe("");
  });
});

describe("Test the arbitraryTypeToText function", () => {
  it("should return strings as-is", () => {
    expect(arbitraryTypeToText("hello world")).toBe("hello world");
    expect(arbitraryTypeToText("")).toBe("");
    expect(arbitraryTypeToText("test string")).toBe("test string");
  });

  it("should convert numbers to strings", () => {
    expect(arbitraryTypeToText(42)).toBe("42");
    expect(arbitraryTypeToText(0)).toBe("0");
    expect(arbitraryTypeToText(-15)).toBe("-15");
    expect(arbitraryTypeToText(3.14159)).toBe("3.14159");
  });

  it("should convert arrays to comma-separated strings", () => {
    expect(arbitraryTypeToText(["a", "b", "c"])).toBe("a, b, c");
    expect(arbitraryTypeToText([1, 2, 3])).toBe("1, 2, 3");
    expect(arbitraryTypeToText([])).toBe("");
    expect(arbitraryTypeToText(["single"])).toBe("single");
  });

  it("should handle nested arrays", () => {
    expect(
      arbitraryTypeToText([
        ["a", "b"],
        ["c", "d"],
      ])
    ).toBe("a, b, c, d");
    expect(
      arbitraryTypeToText([
        [1, 2],
        [3, 4],
      ])
    ).toBe("1, 2, 3, 4");
  });

  it("should handle mixed arrays", () => {
    expect(arbitraryTypeToText(["string", 42, true])).toBe("string, 42, true");
    expect(arbitraryTypeToText([null, undefined, "test"])).toBe(
      "null, undefined, test"
    );
  });

  it("should convert objects to JSON strings", () => {
    expect(arbitraryTypeToText({ name: "test", value: 42 })).toBe(
      '{"name":"test","value":42}'
    );
    expect(arbitraryTypeToText({})).toBe("{}");
    expect(arbitraryTypeToText({ nested: { prop: "value" } })).toBe(
      '{"nested":{"prop":"value"}}'
    );
  });

  it("should handle null and undefined values", () => {
    expect(arbitraryTypeToText(null)).toBe("null");
    expect(arbitraryTypeToText(undefined)).toBe("undefined");
  });

  it("should handle boolean values", () => {
    expect(arbitraryTypeToText(true)).toBe("true");
    expect(arbitraryTypeToText(false)).toBe("false");
  });

  it("should handle special values", () => {
    expect(arbitraryTypeToText(NaN)).toBe("NaN");
    expect(arbitraryTypeToText(Infinity)).toBe("Infinity");
    expect(arbitraryTypeToText(-Infinity)).toBe("-Infinity");
  });

  it("should handle complex nested structures", () => {
    const complexValue = {
      strings: ["a", "b"],
      numbers: [1, 2],
      nested: { prop: "value" },
    };
    expect(arbitraryTypeToText(complexValue)).toBe(
      '{"strings":["a","b"],"numbers":[1,2],"nested":{"prop":"value"}}'
    );
  });

  it("should handle arrays containing objects", () => {
    const arrayWithObjects = [{ id: 1 }, { id: 2 }];
    expect(arbitraryTypeToText(arrayWithObjects)).toBe('{"id":1}, {"id":2}');
  });
});

describe("Test the isStringArrayProperty utility function", () => {
  // Valid cases
  it("should return true for valid string array properties", () => {
    const obj = { validProp: ["string1", "string2", "string3"] };
    expect(isStringArrayProperty(obj, "validProp")).toBe(true);
  });

  it("should return true for single-element string arrays", () => {
    const obj = { singleProp: ["onlyString"] };
    expect(isStringArrayProperty(obj, "singleProp")).toBe(true);
  });

  it("should return false for null object", () => {
    // Using type assertion to test runtime behavior
    expect(isStringArrayProperty(null as any, "anyProp")).toBe(false);
  });

  it("should return false for undefined object", () => {
    // Using type assertion to test runtime behavior
    expect(isStringArrayProperty(undefined as any, "anyProp")).toBe(false);
  });

  it("should return false for non-existent properties", () => {
    const obj = { existingProp: ["string1"] };
    expect(isStringArrayProperty(obj, "nonExistentProp" as any)).toBe(false);
  });

  it("should return false for inherited properties", () => {
    const parent = { inheritedProp: ["string1", "string2"] };
    const child = Object.create(parent);
    child.ownProp = ["string3"];

    expect(isStringArrayProperty(child, "ownProp")).toBe(true);
    expect(isStringArrayProperty(child, "inheritedProp")).toBe(false);
  });

  it("should return false for non-array properties", () => {
    const obj = {
      stringProp: "not an array",
      numberProp: 123,
      objectProp: { key: "value" },
      booleanProp: true,
      nullProp: null,
      undefinedProp: undefined,
    };

    expect(isStringArrayProperty(obj, "stringProp")).toBe(false);
    expect(isStringArrayProperty(obj, "numberProp")).toBe(false);
    expect(isStringArrayProperty(obj, "objectProp")).toBe(false);
    expect(isStringArrayProperty(obj, "booleanProp")).toBe(false);
    expect(isStringArrayProperty(obj, "nullProp")).toBe(false);
    expect(isStringArrayProperty(obj, "undefinedProp")).toBe(false);
  });

  it("should return false for empty arrays", () => {
    const obj = { emptyArray: [] };
    expect(isStringArrayProperty(obj, "emptyArray")).toBe(false);
  });

  it("should return false for arrays containing numbers", () => {
    const obj = { numberArray: [1, 2, 3] };
    expect(isStringArrayProperty(obj, "numberArray")).toBe(false);
  });

  it("should return false for arrays containing mixed types", () => {
    const obj = { mixedArray: ["string", 123, true, null] };
    expect(isStringArrayProperty(obj, "mixedArray")).toBe(false);
  });

  it("should return false for arrays containing objects", () => {
    const obj = { objectArray: [{ key: "value" }, { key2: "value2" }] };
    expect(isStringArrayProperty(obj, "objectArray")).toBe(false);
  });

  it("should handle arrays with empty strings", () => {
    const obj = { emptyStringArray: ["", "non-empty", ""] };
    expect(isStringArrayProperty(obj, "emptyStringArray")).toBe(true);
  });

  it("should handle arrays with special string characters", () => {
    const obj = {
      specialChars: ["hello\nworld", "tab\there", "unicode: 🚀", ""],
    };
    expect(isStringArrayProperty(obj, "specialChars")).toBe(true);
  });

  it("should work with complex object structures", () => {
    interface ComplexObject {
      metadata: {
        tags: string[];
        categories: string[];
      };
      invalidField: number[];
    }

    const complexObj: ComplexObject = {
      metadata: {
        tags: ["tag1", "tag2"],
        categories: ["cat1"],
      },
      invalidField: [1, 2, 3],
    };

    expect(isStringArrayProperty(complexObj.metadata, "tags")).toBe(true);
    expect(isStringArrayProperty(complexObj.metadata, "categories")).toBe(true);
    expect(isStringArrayProperty(complexObj, "invalidField")).toBe(false);
  });

  it("should return false for sparse arrays", () => {
    // Create sparse array programmatically to avoid ESLint no-sparse-arrays rule.
    const sparseArray: string[] = [];
    sparseArray[0] = "string1";
    sparseArray[2] = "string3"; // Index 1 is intentionally left as a hole
    const obj = { sparseArray };
    expect(isStringArrayProperty(obj, "sparseArray")).toBe(false);
  });
});

describe("Test the isObjectArrayProperty utility function", () => {
  it("should return true for valid object arrays", () => {
    const obj = {
      validProp: [{ name: "item1" }, { name: "item2" }],
      singleProp: [{ id: 1 }],
    };
    expect(isObjectArrayProperty(obj, "validProp")).toBe(true);
    expect(isObjectArrayProperty(obj, "singleProp")).toBe(true);
  });

  it("should handle null and undefined objects", () => {
    expect(isObjectArrayProperty(null as any, "anyProp")).toBe(false);
    expect(isObjectArrayProperty(undefined as any, "anyProp")).toBe(false);
  });

  it("should return false for non-existent properties", () => {
    const obj = { existingProp: [{}] };
    expect(isObjectArrayProperty(obj, "nonExistentProp" as any)).toBe(false);
  });

  it("should only check own properties, not inherited ones", () => {
    const parent = { inheritedProp: [{ value: "parent" }] };
    const child = Object.create(parent);
    child.ownProp = [{ value: "child" }];

    expect(isObjectArrayProperty(child, "ownProp")).toBe(true);
    expect(isObjectArrayProperty(child, "inheritedProp")).toBe(false);
  });

  it("should return false for non-array properties", () => {
    const obj = {
      stringProp: "not an array",
      numberProp: 42,
      objectProp: { key: "value" },
      booleanProp: true,
      nullProp: null,
      undefinedProp: undefined,
    };

    expect(isObjectArrayProperty(obj, "stringProp")).toBe(false);
    expect(isObjectArrayProperty(obj, "numberProp")).toBe(false);
    expect(isObjectArrayProperty(obj, "objectProp")).toBe(false);
    expect(isObjectArrayProperty(obj, "booleanProp")).toBe(false);
    expect(isObjectArrayProperty(obj, "nullProp")).toBe(false);
    expect(isObjectArrayProperty(obj, "undefinedProp")).toBe(false);
  });

  it("should return false for empty arrays", () => {
    const obj = { emptyArray: [] };
    expect(isObjectArrayProperty(obj, "emptyArray")).toBe(false);
  });

  it("should return false for arrays of non-objects", () => {
    const obj = {
      numberArray: [1, 2, 3],
      stringArray: ["a", "b", "c"],
      mixedArray: [1, "string", true],
      booleanArray: [true, false],
    };

    expect(isObjectArrayProperty(obj, "numberArray")).toBe(false);
    expect(isObjectArrayProperty(obj, "stringArray")).toBe(false);
    expect(isObjectArrayProperty(obj, "mixedArray")).toBe(false);
    expect(isObjectArrayProperty(obj, "booleanArray")).toBe(false);
  });

  it("should return false for arrays containing null values", () => {
    const obj = {
      nullArray: [{ valid: true }, null, { alsoValid: true }],
      onlyNulls: [null, null],
    };

    expect(isObjectArrayProperty(obj, "nullArray")).toBe(false);
    expect(isObjectArrayProperty(obj, "onlyNulls")).toBe(false);
  });

  it("should return true for arrays of various object types", () => {
    const obj = {
      plainObjects: [{ key: "value" }, { another: "object" }],
      emptyObjects: [{}, {}],
      nestedObjects: [{ nested: { deep: true } }, { shallow: false }],
      dateObjects: [new Date(), new Date()],
      arrayObjects: [[], [1, 2, 3]], // Arrays are objects too
      regexObjects: [/test/, new RegExp("pattern")],
    };

    expect(isObjectArrayProperty(obj, "plainObjects")).toBe(true);
    expect(isObjectArrayProperty(obj, "emptyObjects")).toBe(true);
    expect(isObjectArrayProperty(obj, "nestedObjects")).toBe(true);
    expect(isObjectArrayProperty(obj, "dateObjects")).toBe(true);
    expect(isObjectArrayProperty(obj, "arrayObjects")).toBe(true);
    expect(isObjectArrayProperty(obj, "regexObjects")).toBe(true);
  });

  it("should return false for arrays containing functions", () => {
    // Functions are technically objects in JavaScript, but our type guard
    // is designed for data objects, not function objects
    const obj = {
      functionsArray: [() => {}, function named() {}],
      mixedWithFunctions: [{ data: true }, () => {}],
    };

    expect(isObjectArrayProperty(obj, "functionsArray")).toBe(false);
    expect(isObjectArrayProperty(obj, "mixedWithFunctions")).toBe(false);
  });

  it("should work with complex object structures", () => {
    interface Schema {
      oneOf?: Array<{ required?: string[] }>;
      properties: {
        items: Array<{ type: string; format?: string }>;
      };
    }

    const schema: Schema = {
      oneOf: [{ required: ["field1"] }, { required: ["field2", "field3"] }],
      properties: {
        items: [{ type: "string", format: "email" }, { type: "number" }],
      },
    };

    expect(isObjectArrayProperty(schema, "oneOf")).toBe(true);
    expect(isObjectArrayProperty(schema.properties, "items")).toBe(true);
  });

  it("should return false for sparse arrays", () => {
    // Create sparse array programmatically to avoid ESLint no-sparse-arrays rule.
    const sparseArray: object[] = [];
    sparseArray[0] = { first: true };
    sparseArray[2] = { third: true }; // Index 1 is intentionally left as a hole
    const obj = { sparseArray };

    expect(isObjectArrayProperty(obj, "sparseArray")).toBe(false);
  });
});
