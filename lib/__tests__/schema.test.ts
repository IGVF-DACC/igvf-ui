import type { DatabaseObject, Profiles, SearchResults } from "../../globals.d";
import { itemToSchema, collectionToSchema } from "../schema";

const testProfiles: Profiles = {
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
    const item = { "@type": ["ItemType", "ParentType"] };
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
    const item = { "@type": [] };
    expect(itemToSchema(item, testProfiles)).toBeNull();
  });

  it("returns null if item has no matching @type", () => {
    const item = { "@type": ["UnusedType", "ParentType"] };
    expect(itemToSchema(item, testProfiles)).toBeNull();
  });

  it("returns schema if item has matching @type", () => {
    const item = { "@type": ["ItemType", "ParentType"] };
    const matchingSchema = itemToSchema(item, testProfiles);
    expect(matchingSchema.$id).toEqual("/profiles/test.json");
  });

  it("itemToSchema returns parent schema if item type matches none", () => {
    const item = { "@type": ["ChildType", "ItemType"] };
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
    const collection = { "@type": ["ItemType", "Collection"] };
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
      notification: "Success",
      title: "Item Type",
      total: 0,
    };

    const matchingSchema = collectionToSchema(testCollection, testProfiles);
    expect(matchingSchema.$id).toEqual("/profiles/test.json");
  });
});
