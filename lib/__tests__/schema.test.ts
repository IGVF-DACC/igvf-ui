import type { DatabaseObject, Profiles, SearchResults } from "../../globals";
import {
  collectionToSchema,
  itemToSchema,
  isIndividualSchema,
} from "../schema";

const testProfiles: Profiles = {
  "@type": ["JSONSchemas"],
  _hierarchy: { Item: {} },
  _subtypes: {},
  ItemType: {
    $id: "/profiles/test.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    "@type": ["Test", "ParentTest"],
    additionalProperties: false,
    mixinProperties: [],
    properties: {
      item_prop: {
        title: "Item Property",
        type: "string",
      },
    },
    required: ["item_prop"],
    title: "Test Type",
    type: "string",
  },
};

describe("Test itemToSchema function", () => {
  it("returns null if profiles is null", () => {
    const item = {
      "@id": "/item/1",
      "@type": ["ItemType", "ParentType"],
      status: "released",
    };
    expect(itemToSchema(item, null)).toBeNull();
  });

  it("returns null if item is null", () => {
    expect(itemToSchema(null, testProfiles)).toBeNull();
  });

  it("returns null if item is empty", () => {
    const item = {};
    expect(
      itemToSchema(item as unknown as DatabaseObject, testProfiles)
    ).toBeNull();
  });

  it("returns null if item has no @type", () => {
    const item = { donor: "/donor/path" };
    expect(
      itemToSchema(item as unknown as DatabaseObject, testProfiles)
    ).toBeNull();
  });

  it("returns null if item has empty @type", () => {
    const item = { "@id": "/item/1", "@type": [], status: "released" };
    expect(itemToSchema(item, testProfiles)).toBeNull();
  });

  it("returns null if item has no matching @type", () => {
    const item = {
      "@id": "/item/1",
      "@type": ["UnusedType", "ParentType"],
      status: "released",
    };
    expect(itemToSchema(item, testProfiles)).toBeNull();
  });

  it("returns null if item @type exists but schema is invalid", () => {
    const profilesWithInvalidSchema: Profiles = {
      ...testProfiles,
      InvalidType: "not a schema" as any,
    };
    const item = {
      "@id": "/item/1",
      "@type": ["InvalidType", "ParentType"],
      status: "released",
    };
    expect(itemToSchema(item, profilesWithInvalidSchema)).toBeNull();
  });

  it("returns null if item @type exists but has no properties field", () => {
    const profilesWithBadSchema: Profiles = {
      ...testProfiles,
      BadSchema: {
        $id: "/profiles/bad.json",
        $schema: "https://json-schema.org/draft/2020-12/schema",
        "@type": ["Bad"],
      } as any,
    };
    const item = {
      "@id": "/item/1",
      "@type": ["BadSchema"],
      status: "released",
    };
    expect(itemToSchema(item, profilesWithBadSchema)).toBeNull();
  });

  it("returns schema if item has matching @type", () => {
    const item = {
      "@id": "/item/1",
      "@type": ["ItemType", "ParentType"],
      status: "released",
    };
    const matchingSchema = itemToSchema(item, testProfiles);
    expect(matchingSchema.$id).toEqual("/profiles/test.json");
  });

  it("itemToSchema returns parent schema if item type matches none", () => {
    const item = {
      "@id": "/item/1",
      "@type": ["ChildType", "ItemType"],
      status: "released",
    };
    const matchingSchema = itemToSchema(item, testProfiles);
    expect(matchingSchema.$id).toEqual("/profiles/test.json");
  });
});

describe("Test collectionToSchema function", () => {
  const testCollection: SearchResults = {
    "@context": "/terms/",
    "@graph": [],
    "@id": "/test/",
    "@type": ["TestCollection", "Collection"],
    clear_filters: "/search/?type=Test",
    columns: {
      "@id": {
        title: "ID",
      },
    },
    facets: [],
    filters: [],
    notification: "Success",
    title: "Test",
    total: 0,
  };

  it("returns null if profiles is null", () => {
    expect(collectionToSchema(testCollection, null)).toBeNull();
  });

  it("returns null if collection is null", () => {
    expect(collectionToSchema(null, testProfiles)).toBeNull();
  });

  it("returns null if collection is empty", () => {
    expect(
      collectionToSchema({} as unknown as SearchResults, testProfiles)
    ).toBeNull();
  });

  it("returns null if collection has no @type", () => {
    const collection = { donor: "/donor/path" };
    expect(
      collectionToSchema(collection as unknown as SearchResults, testProfiles)
    ).toBeNull();
  });

  it("returns null if collection has no matching @type", () => {
    const collection = { "@type": ["UnusedCollection", "Collection"] };
    expect(
      collectionToSchema(collection as unknown as SearchResults, testProfiles)
    ).toBeNull();
  });

  it("returns null if collection @type doesn't follow naming convention", () => {
    const collection = {
      "@type": ["ItemType", "Collection"],
      status: "released",
    };
    expect(
      collectionToSchema(collection as unknown as SearchResults, testProfiles)
    ).toBeNull();
  });

  it("returns schema if collection has matching @type", () => {
    const testCollection: SearchResults = {
      "@context": "/terms/",
      "@graph": [],
      "@id": "/test/",
      "@type": ["ItemTypeCollection", "Collection"],
      clear_filters: "/search/?type=ItemType",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facets: [],
      filters: [],
      notification: "Success",
      title: "Item Type",
      total: 0,
    };

    const matchingSchema = collectionToSchema(testCollection, testProfiles);
    expect(matchingSchema.$id).toEqual("/profiles/test.json");
  });
});

describe("isIndividualSchema", () => {
  it("returns true for an object that appears to be a schema", () => {
    const schemaObject = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["JSONSchema"],
    };
    expect(isIndividualSchema(schemaObject)).toBe(true);
  });

  it("returns false for an object that is missing $schema", () => {
    const notSchemaObject = {
      "@type": ["JSONSchema"],
    };
    expect(isIndividualSchema(notSchemaObject)).toBe(false);
  });

  it("returns false for an object that is missing @type", () => {
    const notSchemaObject = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
    };
    expect(isIndividualSchema(notSchemaObject)).toBe(false);
  });

  it("returns false for an object whose @type does not include JSONSchema", () => {
    const notSchemaObject = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["NotASchema"],
    };
    expect(isIndividualSchema(notSchemaObject)).toBe(false);
  });

  it("returns false for a non-object value", () => {
    expect(isIndividualSchema("not an object")).toBe(false);
    expect(isIndividualSchema(123)).toBe(false);
    expect(isIndividualSchema(null)).toBe(false);
    expect(isIndividualSchema(undefined)).toBe(false);
  });
});
