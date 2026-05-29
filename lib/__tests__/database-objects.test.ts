import {
  isDatabaseObject,
  isDatabaseObjectArray,
  isDatabaseObjectArrayOfType,
  isDatabaseObjectOfType,
  pathsFromDatabaseObjects,
} from "../database-object";
import { type FileSetObject } from "../file-sets";
import type { LabObject, UserObject } from "../../globals";

describe("isDatabaseObject", () => {
  test("that an object without `@type` is a database object without checking `@type` but isn't when checking `@type`", () => {
    const obj = {
      "@id": "/construct-library-sets/IGVFDS5436ABCD/",
      accession: "IGVFDS5436ABCD",
      aliases: ["igvf:basic_construct_library_set_0"],
      file_set_type: "reporter library",
      lab: { title: "J. Michael Cherry, Stanford" },
      preferred_assay_titles: ["STARR-seq"],
      samples: [[Object]],
      status: "released",
      summary:
        "reporter library targeting transcription start sites in MYH6 R3 enhancer",
    };
    expect(isDatabaseObject(obj)).toBe(true);
    expect(isDatabaseObject(obj, "checkType")).toBe(false);
  });

  test("that it can detect incorrect types passed as the item", () => {
    expect(isDatabaseObject(null)).toBe(false);
    expect(isDatabaseObject(undefined)).toBe(false);
    expect(isDatabaseObject(123)).toBe(false);
    expect(isDatabaseObject("not an object")).toBe(false);
    expect(isDatabaseObject({ "@id": 123 })).toBe(false);
    expect(isDatabaseObject({ "@id": "/valid/id/" })).toBe(true);

    expect(isDatabaseObject(null, "checkType")).toBe(false);
    expect(isDatabaseObject(undefined, "checkType")).toBe(false);
    expect(isDatabaseObject(123, "checkType")).toBe(false);
    expect(isDatabaseObject("not an object", "checkType")).toBe(false);
    expect(isDatabaseObject({ "@id": 123 }, "checkType")).toBe(false);
    expect(isDatabaseObject({ "@id": "/valid/id/" }, "checkType")).toBe(false);
  });

  test("that it can detect an object without a string `@id`", () => {
    const obj = {
      "@id": 123,
      "@type": ["SomeType"],
    };
    expect(isDatabaseObject(obj)).toBe(false);
    expect(isDatabaseObject(obj, "checkType")).toBe(false);
  });

  test("that it can detect an object with bad `@type`", () => {
    expect(
      isDatabaseObject(
        {
          "@id": "/valid/id/",
          "@type": "Not an array",
        },
        "checkType"
      )
    ).toBe(false);

    expect(
      isDatabaseObject(
        {
          "@id": "/valid/id/",
          "@type": ["ValidType", 123],
        },
        "checkType"
      )
    ).toBe(false);
  });

  test("that it returns false for an error object", () => {
    const errorObj = {
      "@type": ["HTTPNotFound", "Error"],
      code: 404,
      description: "The resource could not be found.",
      detail: "/some/path/",
      status: "error",
      title: "Not Found",
      isError: true,
    };
    expect(isDatabaseObject(errorObj)).toBe(false);
    expect(isDatabaseObject(errorObj, "checkType")).toBe(false);
  });
});

describe("isDatabaseObjectArray", () => {
  test("that it can detect an array of database objects", () => {
    const arr = [
      {
        "@id": "/construct-library-sets/IGVFDS5436ABCD/",
        accession: "IGVFDS5436ABCD",
        aliases: ["igvf:basic_construct_library_set_0"],
        file_set_type: "reporter library",
        lab: "/labs/j-michael-cherry",
        preferred_assay_titles: ["STARR-seq"],
        samples: [[Object]],
        status: "released",
        summary:
          "reporter library targeting transcription start sites in MYH6 R3 enhancer",
      },
      {
        "@id": "/construct-library-sets/IGVFDS5437ABCD/",
        accession: "IGVFDS5437ABCD",
        aliases: ["igvf:basic_construct_library_set_1"],
        file_set_type: "reporter library",
        lab: "/labs/j-michael-cherry",
        preferred_assay_titles: ["STARR-seq"],
        samples: [[Object]],
        status: "released",
        summary:
          "reporter library targeting transcription start sites in MYH6 R3 enhancer",
      },
    ];
    expect(isDatabaseObjectArray(arr)).toBe(true);
    expect(isDatabaseObjectArray(arr, "checkType")).toBe(false);
  });

  test("that it can detect an array with non-database objects", () => {
    const arr = [
      {
        property: "value",
      },
      {
        property: "value",
      },
    ];
    expect(isDatabaseObjectArray(arr)).toBe(false);
    expect(isDatabaseObjectArray(arr, "checkType")).toBe(false);
  });

  test("that it can detect an empty array", () => {
    expect(isDatabaseObjectArray([])).toBe(false);
    expect(isDatabaseObjectArray([], "checkType")).toBe(false);
  });

  test("that it can detect a non-array value", () => {
    expect(isDatabaseObjectArray(null)).toBe(false);
    expect(isDatabaseObjectArray(undefined)).toBe(false);
    expect(isDatabaseObjectArray(123)).toBe(false);
    expect(isDatabaseObjectArray("not an array")).toBe(false);
    expect(isDatabaseObjectArray({ "@id": "/valid/id/" })).toBe(false);

    expect(isDatabaseObjectArray(null, "checkType")).toBe(false);
    expect(isDatabaseObjectArray(undefined, "checkType")).toBe(false);
    expect(isDatabaseObjectArray(123, "checkType")).toBe(false);
    expect(isDatabaseObjectArray("not an array", "checkType")).toBe(false);
    expect(isDatabaseObjectArray({ "@id": "/valid/id/" }, "checkType")).toBe(
      false
    );
  });
});

describe("isDatabaseObjectOfType", () => {
  test("that it can detect a database object of a specific type", () => {
    const obj: FileSetObject = {
      "@id": "/construct-library-sets/IGVFDS5436ABCD/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      accession: "IGVFDS5436ABCD",
      aliases: ["igvf:basic_construct_library_set_0"],
      file_set_type: "reporter library",
      files: [],
      lab: "/labs/j-micael-cherry",
      samples: [
        {
          "@id": "/tissues/IGVFS5436ABCD/",
          "@type": ["Tissues", "Biosample", "Sample", "Item"],
          award: "/awards/HG002497/",
          donors: [
            {
              "@id": "/human-donors/IGVFD5436ABCD/",
              "@type": ["HumanDonor", "Donor", "Item"],
              award: "/awards/HG002497/",
              documents: [],
              lab: "/labs/j-michael-cherry",
              status: "in progress",
            },
          ],
          status: "in progress",
        },
      ],
      status: "released",
      summary:
        "reporter library targeting transcription start sites in MYH6 R3 enhancer",
    };

    expect(isDatabaseObjectOfType(obj, "FileSet")).toBe(true);
  });

  test("that it can detect an object that isn't a database object", () => {
    expect(isDatabaseObjectOfType({ property: "value" }, "File")).toBe(false);
    expect(isDatabaseObjectOfType(null, "File")).toBe(false);
  });
});

describe("isDatabaseObjectArrayOfType", () => {
  test("that it can detect an array of database objects of a specific type", () => {
    const items: LabObject[] = [
      {
        "@id": "/labs/j-michael-cherry",
        "@type": ["Lab", "Item"],
        institute_label: "J. Michael Cherry, Stanford",
        name: "J. Michael Cherry",
        pi: "/users/j-michael-cherry",
        title: "J. Michael Cherry, Stanford",
        status: "current",
      },
      {
        "@id": "/labs/hitz",
        "@type": ["Lab", "Item"],
        institute_label: "Ben Hitz, Stanford",
        name: "Ben Hitz",
        pi: "/users/ben-hitz",
        title: "Ben Hitz, Stanford",
        status: "current",
      },
    ];

    expect(isDatabaseObjectArrayOfType(items, "Lab")).toBe(true);
  });

  test("that it can detect an array that isn't an array of database objects of a specific type", () => {
    const items = [{ property: "value" }, { property: "value" }];

    expect(isDatabaseObjectArrayOfType(items, "Lab")).toBe(false);
    expect(isDatabaseObjectArrayOfType(null, "Lab")).toBe(false);
  });
});

describe("pathsFromDatabaseObjects", () => {
  test("that it can extract paths from an array of database objects", () => {
    const items: UserObject[] = [
      {
        "@id": "/users/j-michael-cherry",
        "@type": ["User", "Item"],
        email: "j-michael-cherry@example.com",
        first_name: "Michael",
        last_name: "Cherry",
        title: "J. Michael Cherry",
        status: "current",
      },
      {
        "@id": "/users/ben-hitz",
        "@type": ["User", "Item"],
        email: "ben-hitz@example.com",
        first_name: "Ben",
        last_name: "Hitz",
        title: "Ben Hitz",
        status: "current",
      },
    ];

    expect(pathsFromDatabaseObjects(items)).toEqual([
      "/users/j-michael-cherry",
      "/users/ben-hitz",
    ]);
  });

  test("that it can return an array of paths if given an array of paths", () => {
    const items = ["/users/j-michael-cherry", "/users/ben-hitz"];

    expect(pathsFromDatabaseObjects(items)).toEqual([
      "/users/j-michael-cherry",
      "/users/ben-hitz",
    ]);
  });

  test("that it returns an empty array if there are no valid database objects", () => {
    const items = [{ property: "value" }, { property: "value" }];

    expect(pathsFromDatabaseObjects(items)).toEqual([]);
    expect(pathsFromDatabaseObjects(null)).toEqual([]);
  });
});
