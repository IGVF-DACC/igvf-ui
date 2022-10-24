import generateTableColumns from "../generate-table-columns";

describe("Tests for generating table columns", () => {
  it("generates the sortable columns object", () => {
    const profiles = {
      Gene: {
        properties: {
          status: {
            title: "Status",
            type: "string",
          },
          name: {
            title: "Name",
            type: "string",
          },
          "@id": {
            title: "ID",
            type: "string",
          },
          locations: {
            title: "Gene Locations",
            type: "array",
            items: {
              title: "Gene Location",
              type: "object",
            },
          },
        },
      },
    };
    const sortableColumns = generateTableColumns(profiles, "Gene");
    expect(sortableColumns).toHaveLength(4);
    expect(sortableColumns[0]).toMatchObject({ id: "status", title: "Status" });
    expect(sortableColumns[1]).toMatchObject({ id: "name", title: "Name" });
    expect(sortableColumns[2]).toMatchObject({ id: "@id", title: "ID" });
    expect(sortableColumns[2]).toHaveProperty("display");
    expect(sortableColumns[2].display).toBeInstanceOf(Function);
    const link = sortableColumns[2].display({
      source: {
        "@id": "http://localhost:3000/path/to/object",
      },
    });
    expect(link).toBeInstanceOf(Object);
  });
});
