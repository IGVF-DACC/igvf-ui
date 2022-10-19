import {
  clearHiddenColumnsFromUrl,
  extractHiddenColumnIdsFromUrl,
  filterHiddenColumns,
  generateHiddenColumnsUrl,
  generateTsvFromCollection,
  getCollectionType,
  loadStoredHiddenColumns,
  saveStoredHiddenColumns,
  sortColumns,
} from "../collection-table";

describe("test clearHiddenColumnsFromUrl", () => {
  it("redirects to a URL without #hidden", () => {
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      "http://localhost:3000/path/to/object#hidden=column1,column2,column3"
    );
    expect(urlWithoutUrlHiddenColumns).toBe(
      "http://localhost:3000/path/to/object"
    );
  });
});

describe("test extractHiddenColumnIdsFromUrl function", () => {
  it("correctly extracts hidden column IDs", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object#hidden=column_1,column_2,column_3"
    );
    expect(hiddenColumnIds).toEqual(["column_1", "column_2", "column_3"]);
  });

  it("detects empty #hidden hashtag", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object#hidden="
    );
    expect(hiddenColumnIds).toEqual([]);
  });

  it("detects a hashtag that doesn't specify hidden columns", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object#visible=column_1,column_2,column_3"
    );
    expect(hiddenColumnIds).toEqual(null);
  });

  it("detects no hashtag at all", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object"
    );
    expect(hiddenColumnIds).toEqual(null);
  });
});

describe("test filterHiddenColumns function", () => {
  const columns = [
    {
      id: "@id",
      label: "ID",
    },
    {
      id: "organism",
      title: "Organism",
    },
    {
      id: "references",
      title: "References",
    },
    {
      id: "url",
      title: "URL",
    },
  ];

  it("filters out hidden column property IDs", () => {
    const hiddenColumnIds = ["organism", "references"];
    const filteredColumns = filterHiddenColumns(columns, hiddenColumnIds);
    expect(filteredColumns).toEqual([
      {
        id: "@id",
        label: "ID",
      },
      {
        id: "url",
        title: "URL",
      },
    ]);
  });
});

describe("Test generateHiddenColumnsUrl function", () => {
  it("generates a URL with #hidden= and the specified columns", () => {
    const hiddenColumnsUrl = generateHiddenColumnsUrl(
      "http://localhost:3000/path/to/object",
      ["column_1", "column_2"]
    );
    expect(hiddenColumnsUrl).toEqual(
      "http://localhost:3000/path/to/object#hidden=column_1,column_2"
    );
  });

  it("generates a URL with no #hidden= when no columns specified", () => {
    const hiddenColumnsUrl = generateHiddenColumnsUrl(
      "http://localhost:3000/path/to/object",
      []
    );
    expect(hiddenColumnsUrl).toEqual("http://localhost:3000/path/to/object");
  });
});

describe("test sortColumns function", () => {
  it("sorts the columns alphabetically except for the @id column", () => {
    const columns = [
      { id: "taxa", title: "Taxa" },
      { id: "url", title: "URL" },
      { id: "@id", title: "ID" },
      { id: "source", title: "Source" },
    ];

    const sortedColumns = sortColumns(columns);
    expect(sortedColumns[0]).toMatchObject({
      id: "@id",
      title: "ID",
    });
    expect(sortedColumns[1]).toMatchObject({
      id: "source",
      title: "Source",
    });
    expect(sortedColumns[2]).toMatchObject({ id: "taxa", title: "Taxa" });
    expect(sortedColumns[3]).toMatchObject({
      id: "url",
      title: "URL",
    });
  });
});

describe("test getCollectionType function", () => {
  it("gets the correct collection type for a normal collection", () => {
    const collection = [
      {
        "@id": "/cell-lines/467c72a2-4f84-2c8f-96b0-ec8715e18185/",
        "@type": ["CellLine", "Biosample", "Sample", "Item"],
        accession: "IGVFSM000AAA",
        source: { institute_label: "Stanford", name: "j-michael-cherry" },
      },
    ];

    const collectionType = getCollectionType(collection);
    expect(collectionType).toEqual("CellLine");
  });

  it("gets an empty collection type if the collection has no @type", () => {
    const collection = [
      {
        "@id": "/cell-lines/467c72a2-4f84-2c8f-96b0-ec8715e18185/",
        accession: "IGVFSM000AAA",
        source: { institute_label: "Stanford", name: "j-michael-cherry" },
      },
    ];

    const collectionType = getCollectionType(collection);
    expect(collectionType).toEqual("");
  });

  it("gets an empty collection type if the collection is empty", () => {
    const collectionType = getCollectionType([]);
    expect(collectionType).toEqual("");
  });
});

describe("test saving and loading hidden columns", () => {
  it("saves the hidden columns and loads them again", () => {
    const hiddenColumns = ["column_1", "column_2"];
    saveStoredHiddenColumns("testing", hiddenColumns);
    const storedHiddenColumns = loadStoredHiddenColumns("testing");
    expect(storedHiddenColumns).toEqual(hiddenColumns);
    const nullHiddenColumns = loadStoredHiddenColumns("not_existing");
    expect(nullHiddenColumns).toEqual(null);
  });
});

describe("test generating the sortable columns object from a profile", () => {
  describe("test generating TSV data from the collection", () => {
    jest.useFakeTimers().setSystemTime(new Date("2021-09-01").getTime());

    const collection = [
      {
        "@id": "/cell-lines/467c72a2-4f84-2c8f-96b0-ec8715e18185/",
        "@type": ["CellLine", "Biosample", "Sample", "Item"],
        accession: "IGVFSM000AAA",
        source: { institute_label: "Stanford", name: "j-michael-cherry" },
      },
    ];
    const columns = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "source", title: "Source" },
      { id: "unknown", title: "Unknown" },
    ];
    const hiddenColumns = ["unknown"];

    const { filename, encodedTsvContent } = generateTsvFromCollection(
      collection,
      "CellLine",
      columns,
      hiddenColumns
    );
    expect(encodedTsvContent).toEqual(
      "data:text/tab-separated-values; charset=utf-8,2021_09_01_00h_00m_00s_UTC%09http%3A%2F%2Flocalhost%2F%23hidden%3Dunknown%0AID%09Accession%09Source%09Unknown%0A%2Fcell-lines%2F467c72a2-4f84-2c8f-96b0-ec8715e18185%2F%09IGVFSM000AAA%09%7B%22institute_label%22%3A%22Stanford%22%2C%22name%22%3A%22j-michael-cherry%22%7D%09"
    );
    expect(filename).toEqual("cellline-2021_09_01_00h_00m_00s_UTC.tsv");
  });
});
