import {
  getReportType,
  getReportTypeColumnSpecs,
  getSchemaForReportType,
  getSortColumn,
  getVisibleReportColumnSpecs,
  schemaColumnsToColumnSpecs,
} from "../report";

const profiles = {
  Award: {
    title: "Grant",
    properties: {
      "@id": {
        title: "ID",
      },
      uuid: {
        title: "UUID",
      },
      notes: {
        title: "Notes",
      },
    },
    columns: {
      "@id": {
        title: "ID",
      },
      uuid: {
        title: "UUID",
      },
    },
  },
  Biosample: {
    title: "Biosample",
    properties: {
      "@id": {
        title: "ID",
      },
      uuid: {
        title: "UUID",
      },
      accession: {
        title: "Accession",
      },
    },
  },
};

describe("Test `getSchemaForReportType()`", () => {
  it("should return the correct schema for a report type", () => {
    const schema = getSchemaForReportType("Biosample", profiles);
    expect(schema).toEqual(profiles.Biosample);
  });

  it("should return null for unknown report types", () => {
    const schema = getSchemaForReportType("Unknown", profiles);
    expect(schema).toBeNull();
  });
});

describe("Test `getReportType()`", () => {
  it("should return the correct report type for a report including a type filter", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/primary-cells/IGVFSM0000EEEE/",
          "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0000EEEE",
          uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
        },
      ],
      filters: [
        {
          field: "type",
          term: "CellLine",
          remove: "/report",
        },
      ],
    };

    const reportType = getReportType(searchResults);
    expect(reportType).toEqual("CellLine");
  });

  it("should return an empty report-type string for a report not including a type filter", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/primary-cells/IGVFSM0000EEEE/",
          "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0000EEEE",
          uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
        },
      ],
      filters: [
        {
          field: "searchTerm",
          term: "ChIP-seq",
          remove: "/report",
        },
      ],
    };

    const reportType = getReportType(searchResults);
    expect(reportType).toEqual("");
  });
});

describe("Test `getReportTypeColumnSpecs()`", () => {
  it("should return column specs for a known report type", () => {
    const columnSpecs = getReportTypeColumnSpecs("Biosample", profiles);
    expect(columnSpecs).toEqual([
      {
        id: "@id",
        title: "ID",
      },
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "uuid",
        title: "UUID",
      },
    ]);
  });

  it("should return an empty array for an unknown report type", () => {
    const columnSpecs = getReportTypeColumnSpecs("Unknown", profiles);
    expect(columnSpecs).toEqual([]);
  });
});

describe("Test `getVisibleReportColumnSpecs()`", () => {
  it("should return column specs for a known report type with no field= in the query string", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/tissues/IGVFSM003DDD/",
          "@type": ["Tissue", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003DDD",
          award: "/awards/HG012012/",
          biosample_term: "/sample-terms/UBERON_0002048/",
          donors: ["/rodent-donors/IGVFDO820DHC/"],
          lab: "/labs/j-michael-cherry/",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "fd5524f2-0303-11ed-b939-0242ac120002",
        },
      ],
      "@id": "/search?type=Biosample",
      "@type": ["Search"],
      clear_filters: "/search?type=Biosample",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        accession: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "Biosample",
          remove: "/search",
        },
      ],
      title: "Search",
      total: 1,
    };

    const columnSpecs = getVisibleReportColumnSpecs(searchResults, profiles);

    expect(columnSpecs).toEqual([
      {
        id: "@id",
        title: "ID",
      },
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "uuid",
        title: "UUID",
      },
    ]);
  });

  it("should return column specs for a known report type with no field= in the query string", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/tissues/IGVFSM003DDD/",
          "@type": ["Tissue", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003DDD",
          award: "/awards/HG012012/",
          biosample_term: "/sample-terms/UBERON_0002048/",
          donors: ["/rodent-donors/IGVFDO820DHC/"],
          lab: "/labs/j-michael-cherry/",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "fd5524f2-0303-11ed-b939-0242ac120002",
        },
      ],
      "@id": "/search?type=Biosample",
      "@type": ["Search"],
      clear_filters: "/search?type=Biosample",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        accession: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "Biosample",
          remove: "/search",
        },
      ],
      title: "Search",
      total: 1,
    };

    const columnSpecs = getVisibleReportColumnSpecs(searchResults, profiles);

    expect(columnSpecs).toEqual([
      {
        id: "@id",
        title: "ID",
      },
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "uuid",
        title: "UUID",
      },
    ]);
  });

  it("should return column specs for a known report type with field= in the query string", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/tissues/IGVFSM003DDD/",
          "@type": ["Tissue", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003DDD",
          award: "/awards/HG012012/",
          biosample_term: "/sample-terms/UBERON_0002048/",
          donors: ["/rodent-donors/IGVFDO820DHC/"],
          lab: "/labs/j-michael-cherry/",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "fd5524f2-0303-11ed-b939-0242ac120002",
        },
      ],
      "@id": "/search?type=Biosample&field=@id&field=uuid&field=notreal",
      "@type": ["Search"],
      clear_filters: "/search?type=Biosample",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        accession: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "Biosample",
          remove: "/search",
        },
      ],
      title: "Search",
      total: 1,
    };

    const columnSpecs = getVisibleReportColumnSpecs(searchResults, profiles);

    expect(columnSpecs).toEqual([
      {
        id: "@id",
        title: "ID",
      },
      {
        id: "uuid",
        title: "UUID",
      },
    ]);
  });

  it("should return no column specs for an unknown report type", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/whole-organisms/IGVFSM003KAS/",
          "@type": ["WholeOrganism", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003KAS",
          award: "/awards/HG012012/",
          biosample_term: "/sample-terms/UBERON_0000468/",
          lab: "/labs/j-michael-cherry/",
          status: "released",
          taxa: "Mus musculus",
          uuid: "d4c46526-0307-11ed-b939-0242ac120002",
        },
      ],
      "@id": "/search?type=WholeOrganism&field=@id&field=uuid",
      "@type": ["Search"],
      clear_filters: "/search?type=WholeOrganism",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        accession: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "WholeOrganism",
          remove: "/search",
        },
      ],
      title: "Search",
      total: 1,
    };

    const columnSpecs = getVisibleReportColumnSpecs(searchResults, profiles);

    expect(columnSpecs).toEqual([]);
  });
});

describe("Test `getSortColumn()`", () => {
  it("returns the specified sorting column ID", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/whole-organisms/IGVFSM003KAS/",
          "@type": ["WholeOrganism", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003KAS",
        },
      ],
      "@id": "/search?type=WholeOrganism&sort=accession",
      "@type": ["Search"],
      clear_filters: "/search?type=WholeOrganism",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        accession: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "WholeOrganism",
          remove: "/search",
        },
      ],
      title: "Search",
      total: 1,
    };

    const sortColumn = getSortColumn(searchResults);
    expect(sortColumn).toEqual("accession");
  });

  it("returns an empty string for specified sorting column ID", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/whole-organisms/IGVFSM003KAS/",
          "@type": ["WholeOrganism", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003KAS",
        },
      ],
      "@id": "/search?type=WholeOrganism",
      "@type": ["Search"],
      clear_filters: "/search?type=WholeOrganism",
      columns: {
        "@id": {
          title: "ID",
        },
        uuid: {
          title: "UUID",
        },
        accession: {
          title: "Accession",
        },
      },
      filters: [
        {
          field: "type",
          term: "WholeOrganism",
          remove: "/search",
        },
      ],
      title: "Search",
      total: 1,
    };

    const sortColumn = getSortColumn(searchResults);
    expect(sortColumn).toEqual("");
  });
});

describe("Test `schemaColumnsToColumnSpecs()`", () => {
  it("should return sorted columnSpecs for schema", () => {
    const columnSpecs = schemaColumnsToColumnSpecs(profiles.Award.columns);
    expect(columnSpecs).toEqual([
      {
        id: "@id",
        title: "ID",
      },
      {
        id: "uuid",
        title: "UUID",
      },
    ]);
  });
});
