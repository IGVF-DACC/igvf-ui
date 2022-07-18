import {
  clearHiddenColumnsFromUrl,
  extractHiddenColumnIdsFromUrl,
  filterHiddenColumns,
  generateHiddenColumnsUrl,
} from "../collection-table"

describe("test clearHiddenColumnsFromUrl", () => {
  it("redirects to a URL without #hidden", () => {
    const urlWithoutUrlHiddenColumns = clearHiddenColumnsFromUrl(
      "http://localhost:3000/path/to/object#hidden=column1,column2,column3"
    )
    expect(urlWithoutUrlHiddenColumns).toBe(
      "http://localhost:3000/path/to/object"
    )
  })
})

describe("test extractHiddenColumnIdsFromUrl function", () => {
  it("correctly extracts hidden column IDs", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object#hidden=column_1,column_2,column_3"
    )
    expect(hiddenColumnIds).toEqual(["column_1", "column_2", "column_3"])
  })

  it("detects empty #hidden hashtag", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object#hidden="
    )
    expect(hiddenColumnIds).toEqual([])
  })

  it("detects a hashtag that doesn't specify hidden columns", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object#visible=column_1,column_2,column_3"
    )
    expect(hiddenColumnIds).toEqual(null)
  })

  it("detects no hashtag at all", () => {
    const hiddenColumnIds = extractHiddenColumnIdsFromUrl(
      "http://localhost:3000/path/to/object"
    )
    expect(hiddenColumnIds).toEqual(null)
  })
})

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
  ]

  it("filters out hidden column property IDs", () => {
    const hiddenColumnIds = ["organism", "references"]
    const filteredColumns = filterHiddenColumns(columns, hiddenColumnIds)
    expect(filteredColumns).toEqual([
      {
        id: "@id",
        label: "ID",
      },
      {
        id: "url",
        title: "URL",
      },
    ])
  })
})

describe("test generateHiddenColumnsUrl function", () => {
  it("generates a URL with #hidden= and the specified columns", () => {
    const hiddenColumnsUrl = generateHiddenColumnsUrl(
      "http://localhost:3000/path/to/object",
      ["column_1", "column_2"]
    )
    expect(hiddenColumnsUrl).toEqual(
      "http://localhost:3000/path/to/object#hidden=column_1,column_2"
    )
  })

  it("generates a URL with no #hidden= when no columns specified", () => {
    const hiddenColumnsUrl = generateHiddenColumnsUrl(
      "http://localhost:3000/path/to/object",
      []
    )
    expect(hiddenColumnsUrl).toEqual("http://localhost:3000/path/to/object")
  })
})
