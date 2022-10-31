import {
  clearHiddenColumnsFromUrl,
  externalResourcesComposer,
  extractHiddenColumnIdsFromUrl,
  filterHiddenColumns,
  geneLocationsComposer,
  generateHiddenColumnsUrl,
  generateTsvFromCollection,
  getCollectionType,
  healthStatusHistoriesComposer,
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

describe("Test generating the sortable columns object from a profile", () => {
  it("generates TSV data from the collection", () => {
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

  it("generates TSV data from a collection with custom collection properties", () => {
    const collection = [
      {
        "@id": "/genes/ENSG00000163930/",
        "@type": ["Gene", "Item"],
        accession: "ENSG00000163930",
        locations: [
          {
            end: 52410030,
            start: 52401004,
            assembly: "GRCh38",
            chromosome: "chr3",
          },

          {
            end: 52444024,
            start: 52435024,
            assembly: "hg19",
            chromosome: "chr3",
          },
        ],
      },
    ];
    const columns = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "locations", title: "Locations" },
    ];
    const hiddenColumns = [];

    const { filename, encodedTsvContent } = generateTsvFromCollection(
      collection,
      "Gene",
      columns,
      hiddenColumns
    );
    expect(encodedTsvContent).toEqual(
      "data:text/tab-separated-values; charset=utf-8,2021_09_01_00h_00m_00s_UTC%09http%3A%2F%2Flocalhost%2F%0AID%09Accession%09Locations%0A%2Fgenes%2FENSG00000163930%2F%09ENSG00000163930%09chr3%3A52401004-52410030%20(GRCh38)%2C%20chr3%3A52435024-52444024%20(hg19)"
    );
    expect(filename).toEqual("gene-2021_09_01_00h_00m_00s_UTC.tsv");
  });

  it("generates TSV data from a collection with embedded accessioned objects", () => {
    const collection = [
      {
        "@id": "/human-donors/IGVFDO537ZSC/",
        "@type": ["HumanDonor", "Donor", "Item"],
        accession: "IGVFDO537ZSC",
        parents: [
          {
            "@id": "/human-donors/IGVFDO537ZSC/",
            "@type": ["HumanDonor", "Donor", "Item"],
            accession: "IGVFDO537ZSC",
          },
        ],
      },
    ];
    const columns = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "parents", title: "Parents" },
    ];
    const hiddenColumns = [];

    const { filename, encodedTsvContent } = generateTsvFromCollection(
      collection,
      "HumanDonor",
      columns,
      hiddenColumns
    );

    expect(encodedTsvContent).toEqual(
      "data:text/tab-separated-values; charset=utf-8,2021_09_01_00h_00m_00s_UTC%09http%3A%2F%2Flocalhost%2F%0AID%09Accession%09Parents%0A%2Fhuman-donors%2FIGVFDO537ZSC%2F%09IGVFDO537ZSC%09%2Fhuman-donors%2FIGVFDO537ZSC%2F"
    );
    expect(filename).toEqual("humandonor-2021_09_01_00h_00m_00s_UTC.tsv");
  });

  it("generates TSV data from a collection with a single embedded accessioned object", () => {
    const collection = [
      {
        "@id": "/technical-samples/IGVFSM681GIX/",
        "@type": ["TechnicalSample", "Sample", "Item"],
        accession: "IGVFSM681GIX",
        technical_sample_term: {
          "@id": "/sample-terms/NTR_0000637/",
          "@type": ["SampleTerm", "OntologyTerm", "Item"],
        },
        submitter_comment:
          "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment. Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.",
        numeric_property: 123,
      },
    ];
    const columns = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "technical_sample_term", title: "Technical Sample Term" },
      { id: "submitter_comment", title: "Submitter Comment" },
      { id: "numeric_property", title: "Numeric Property" },
    ];
    const hiddenColumns = [];

    const { filename, encodedTsvContent } = generateTsvFromCollection(
      collection,
      "HumanDonor",
      columns,
      hiddenColumns
    );

    expect(encodedTsvContent).toEqual(
      "data:text/tab-separated-values; charset=utf-8,2021_09_01_00h_00m_00s_UTC%09http%3A%2F%2Flocalhost%2F%0AID%09Accession%09Technical%20Sample%20Term%09Submitter%20Comment%09Numeric%20Property%0A%2Ftechnical-samples%2FIGVFSM681GIX%2F%09IGVFSM681GIX%09%2Fsample-terms%2FNTR_0000637%2F%09Leverage%20agile%20frameworks%20to%20provide%20a%20robust%20synopsis%20for%20high%20level%20overviews.%20Iterative%20approaches%20to%20corporate%20strategy%20foster%20collaborative%20thinking%20to%20further%20the%20overall%20value%20proposition.%20Organically%20grow%20the%20holistic%20world%20view%20of%20disruptive%20innovation%20via%20workplace%20diversity%20and%20empowerment.%20Bring%20to%20the%20table%20win-win%20survival%20strategies%20to%20ensure%20proactive%20domination.%20At%20the%20end%20of%20the%20day%2C%20going%20forward%2C%20a%20new%20normal%20that%20has%20evolved%20from%20generation%20X%20is%20on%20the%20runway%20headi%09123"
    );
    expect(filename).toEqual("humandonor-2021_09_01_00h_00m_00s_UTC.tsv");
  });
});

describe("Test the `externalResourceComposer` function", () => {
  it("displays external resource data", () => {
    // Supply one with and one without `resource_url`.
    const externalResource = [
      {
        resource_url: "https://www.ncbi.nlm.nih.gov/nuccore/S77007.1",
        resource_name:
          "{control region, restriction length polymorphism RFLP} [human, Senegalese Mandenka West African population sample, Mitochondrial, 89 nt]",
        resource_identifier: "GenBank: S77007.1",
      },
      {
        resource_name:
          "BRCA1 {exon 23, internal fragment} [human, serous papillary ovarian adenocarcinoma, patient sample 61, Genomic Mutant, 68 nt]",
        resource_identifier: "GenBank: S78558.1",
      },
    ];

    const externalResourceData = externalResourcesComposer(externalResource);

    expect(externalResourceData).toEqual(
      "{control region, restriction length polymorphism RFLP} [human, Senegalese Mandenka West African population sample, Mitochondrial, 89 nt] - GenBank: S77007.1 - https://www.ncbi.nlm.nih.gov/nuccore/S77007.1; BRCA1 {exon 23, internal fragment} [human, serous papillary ovarian adenocarcinoma, patient sample 61, Genomic Mutant, 68 nt] - GenBank: S78558.1"
    );
  });
});

describe("Test the `geneLocationsComposer` function", () => {
  it("displays multiple gene location data", () => {
    const geneLocation = [
      {
        end: 52410030,
        start: 52401004,
        assembly: "GRCh38",
        chromosome: "chr3",
      },

      {
        end: 52444024,
        start: 52435024,
        assembly: "hg19",
        chromosome: "chr3",
      },
    ];

    const geneLocationData = geneLocationsComposer(geneLocation);

    expect(geneLocationData).toEqual(
      "chr3:52401004-52410030 (GRCh38), chr3:52435024-52444024 (hg19)"
    );
  });
});

describe("Test the `healthStatusHistoriesComposer` function", () => {
  it("displays multiple health status history data", () => {
    const healthStatusHistory = [
      {
        date_end: "2022-01-10",
        date_start: "2022-01-04",
        health_description: "Running fever 103F, feeling tired",
      },

      {
        date_end: "2022-01-10",
        date_start: "2021-12-03",
        health_description: "Running fever 103F, feeling tired",
      },
    ];

    const healthStatusHistoryData =
      healthStatusHistoriesComposer(healthStatusHistory);

    expect(healthStatusHistoryData).toEqual(
      "January 4, 2022 - January 10, 2022: Running fever 103F, feeling tired; December 3, 2021 - January 10, 2022: Running fever 103F, feeling tired"
    );
  });
});
