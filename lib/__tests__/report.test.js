import {
  getMergedSchemaProperties,
  getReportTypeColumnSpecs,
  getSchemasForReportTypes,
  getSelectedTypes,
  getSortColumn,
  columnsToColumnSpecs,
} from "../report";

const profiles = {
  Award: {
    title: "Grant",
    properties: {
      "@id": {
        title: "ID",
        type: "string",
      },
      uuid: {
        type: "string",
      },
      notes: {
        title: "Notes",
        type: "string",
      },
    },
    columns: {
      "@id": {
        title: "ID",
      },
      uuid: {},
    },
  },
  Lab: {
    title: "Lab",
    properties: {
      "@id": {
        title: "ID",
        type: "string",
      },
      uuid: {
        title: "UUID",
        type: "string",
      },
      name: {
        title: "Name",
        type: "string",
      },
    },
  },
  Tissue: {
    title: "Tissue",
    properties: {
      "@id": {
        title: "ID",
        type: "string",
      },
      uuid: {
        title: "UUID",
        type: "string",
      },
      accession: {
        title: "Accession",
        type: "string",
      },
    },
  },
  _subtypes: {
    Biosample: ["Tissue"],
  },
};

describe("Test `getSchemasForReportTypes()`", () => {
  it("should return the correct schema for a concrete report type", () => {
    const schemas = getSchemasForReportTypes(["Award"], profiles);
    expect(schemas).toHaveLength(1);
    expect(schemas[0].title).toEqual("Grant");
  });

  it("should return the correct schema for an abstract report type", () => {
    const schemas = getSchemasForReportTypes(["Biosample"], profiles);
    expect(schemas).toHaveLength(1);
    expect(schemas[0].title).toEqual("Tissue");
  });

  it("should return the correct schemas for multiple concrete report types", () => {
    const schemas = getSchemasForReportTypes(["Award", "Lab"], profiles);
    expect(schemas).toHaveLength(2);
    expect(schemas[0].title).toEqual("Grant");
    expect(schemas[1].title).toEqual("Lab");
  });

  it("should return the correct schemas for abstract and concrete report types", () => {
    const schemas = getSchemasForReportTypes(["Award", "Biosample"], profiles);
    expect(schemas).toHaveLength(2);
    expect(schemas[0].title).toEqual("Grant");
    expect(schemas[1].title).toEqual("Tissue");
  });

  it("should return an empty array for unknown report types", () => {
    const schemas = getSchemasForReportTypes(["Unknown"], profiles);
    expect(schemas).toHaveLength(0);
  });

  it("should return null if profiles hasn't yet loaded", () => {
    const schemas = getSchemasForReportTypes(["Award"], null);
    expect(schemas).toBeNull();
  });
});

describe("Test `getSelectedTypes()`", () => {
  it("should return the correct report type for a report including a type filter", () => {
    const searchResults = {
      "@context": "/terms/",
      "@id": "/multireport/?type=PrimaryCell",
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
          term: "PrimaryCell",
          remove: "/multireport",
        },
      ],
    };

    const types = getSelectedTypes(searchResults);
    expect(types).toHaveLength(1);
    expect(types[0]).toEqual("PrimaryCell");
  });

  it("should return the correct report types for a report including multiple type filters", () => {
    const searchResults = {
      "@context": "/terms/",
      "@id": "/multireport/?type=PrimaryCell&type=Tissue",
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
          term: "PrimaryCell",
          remove: "/multireport/?type=Tissue",
        },
        {
          field: "type",
          term: "Tissue",
          remove: "/multireport/?type=PrimaryCell",
        },
      ],
    };

    const reportTypes = getSelectedTypes(searchResults);
    expect(reportTypes).toHaveLength(2);
    expect(reportTypes[0]).toEqual("PrimaryCell");
    expect(reportTypes[1]).toEqual("Tissue");
  });

  it("should return the correct report types with a config filter", () => {
    const searchResults = {
      "@context": "/terms/",
      "@id": "/multireport/?type=PrimaryCell&type=Tissue&config=InVitroSystem",
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
          term: "PrimaryCell",
          remove: "/multireport/?type=Tissue&config=InVitroSystem",
        },
        {
          field: "type",
          term: "Tissue",
          remove: "/multireport/?type=PrimaryCell&config=InVitroSystem",
        },
      ],
    };

    const reportTypes = getSelectedTypes(searchResults);
    expect(reportTypes).toHaveLength(1);
    expect(reportTypes[0]).toEqual("InVitroSystem");
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
          field: "query",
          term: "ChIP-seq",
          remove: "/multireport",
        },
      ],
    };

    const reportTypes = getSelectedTypes(searchResults);
    expect(reportTypes).toHaveLength(0);
  });
});

describe("Test `getReportTypeColumnSpecs()`", () => {
  it("should return column specs for a known report type", () => {
    const columnSpecs = getReportTypeColumnSpecs(["Biosample"], profiles);
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
    const columnSpecs = getReportTypeColumnSpecs(["Unknown"], profiles);
    expect(columnSpecs).toEqual([]);
  });
});

describe("Test `getMergedSchemaProperties()`", () => {
  it("correctly merges properties from multiple schemas", () => {
    const tissueSchema = {
      $id: "/profiles/tissue.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["JSONSchema"],
      properties: {
        "@id": {
          title: "ID",
          type: "string",
        },
        "@type": {
          items: {
            type: "string",
          },
          title: "Type",
          type: "array",
        },
        accession: {
          title: "Accession",
          type: "string",
        },
        moi: {
          title: "Multiplicity Of Infection",
          type: "number",
        },
      },
    };

    const primaryCellSchema = {
      $id: "/profiles/primary_cell.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["JSONSchema"],
      properties: {
        "@id": {
          title: "ID",
          type: "string",
        },
        "@type": {
          items: {
            type: "string",
          },
          title: "Type",
          type: "array",
        },
        accession: {
          title: "Accession",
          type: "string",
        },
        age: {
          title: "Age",
          type: "string",
        },
        age_units: {
          title: "Age Units",
          type: "string",
        },
      },
    };

    const mergedProperties = getMergedSchemaProperties([
      tissueSchema,
      primaryCellSchema,
    ]);

    const mergedKeys = Object.keys(mergedProperties);
    expect(mergedKeys).toHaveLength(6);
    expect(mergedKeys).toContain("@id");
    expect(mergedKeys).toContain("@type");
    expect(mergedKeys).toContain("accession");
    expect(mergedKeys).toContain("moi");
    expect(mergedKeys).toContain("age");
    expect(mergedKeys).toContain("age_units");
  });

  it("returns null when passed null", () => {
    const mergedProperties = getMergedSchemaProperties(null);
    expect(mergedProperties).toBeNull();
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

describe("Test `columnsToColumnSpecs()`", () => {
  it("should return sorted columnSpecs for schema", () => {
    const columnSpecs = columnsToColumnSpecs(profiles.Award.columns);
    expect(columnSpecs).toEqual([
      {
        id: "@id",
        title: "ID",
      },
      {
        id: "uuid",
      },
    ]);
  });
});
