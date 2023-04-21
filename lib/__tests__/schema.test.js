import { itemToSchema, collectionToSchema } from "../schema";

describe("Test itemToSchema function", () => {
  it("returns null if profiles is null", () => {
    const item = { "@type": ["ItemType", "ParentType"] };
    const profiles = null;
    expect(itemToSchema(item, profiles)).toBeNull();
  });

  it("returns null if item is null", () => {
    const item = null;
    const profiles = { ItemType: {} };
    expect(itemToSchema(item, profiles)).toBeNull();
  });

  it("returns null if item is empty", () => {
    const item = {};
    const profiles = { ItemType: {} };
    expect(itemToSchema(item, profiles)).toBeNull();
  });

  it("returns null if item has no @type", () => {
    const item = { donor: "/donor/path" };
    const profiles = { ItemType: {} };
    expect(itemToSchema(item, profiles)).toBeNull();
  });

  it("returns null if item has empty @type", () => {
    const item = { "@type": [] };
    const profiles = { ItemType: {} };
    expect(itemToSchema(item, profiles)).toBeNull();
  });

  it("returns null if item has no matching @type", () => {
    const item = { "@type": ["UnusedType", "ParentType"] };
    const profiles = {
      ItemType: { item_prop: "A" },
    };
    expect(itemToSchema(item, profiles)).toBeNull();
  });

  it("returns schema if item has matching @type", () => {
    const item = { "@type": ["ItemType", "ParentType"] };
    const profiles = {
      ItemType: { item_prop: "A" },
      ParentType: { item_prop: "B" },
    };
    expect(itemToSchema(item, profiles)).toEqual({ item_prop: "A" });
  });

  it("itemToSchema returns parent schema if item type matches none", () => {
    const item = { "@type": ["ItemType", "ParentType"] };
    const profiles = {
      ParentType: { item_prop: "B" },
    };
    expect(itemToSchema(item, profiles)).toEqual({ item_prop: "B" });
  });
});

describe("Test collectionToSchema function", () => {
  it("returns null if profiles is null", () => {
    const collection = { "@type": ["ItemCollection"] };
    const profiles = null;
    expect(collectionToSchema(collection, profiles)).toBeNull();
  });

  it("returns null if collection is null", () => {
    const collection = null;
    const profiles = { CollectionType: {} };
    expect(collectionToSchema(collection, profiles)).toBeNull();
  });

  it("returns null if collection is empty", () => {
    const collection = {};
    const profiles = { CollectionType: {} };
    expect(collectionToSchema(collection, profiles)).toBeNull();
  });

  it("returns null if collection has no @type", () => {
    const collection = { donor: "/donor/path" };
    const profiles = { CollectionType: {} };
    expect(collectionToSchema(collection, profiles)).toBeNull();
  });

  it("returns null if collection has no matching @type", () => {
    const collection = { "@type": ["UnusedCollection", "Collection"] };
    const profiles = {
      Item: {},
    };
    expect(collectionToSchema(collection, profiles)).toBeNull();
  });

  it("returns null if collection @type doesn't follow naming convention", () => {
    const collection = { "@type": ["ItemType", "Collection"] };
    const profiles = {
      Item: { collection_prop: "A" },
      Parent: { collection_prop: "B" },
    };
    expect(collectionToSchema(collection, profiles)).toBeNull();
  });

  it("returns schema if collection has matching @type", () => {
    const collection = { "@type": ["ItemCollection", "Collection"] };
    const profiles = {
      Item: { collection_prop: "A" },
      Parent: { collection_prop: "B" },
    };
    expect(collectionToSchema(collection, profiles)).toEqual({
      collection_prop: "A",
    });
  });
});
