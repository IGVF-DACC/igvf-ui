import type {
  DatabaseObject,
  Profiles,
  Schema,
  SearchResults,
  SearchResultsColumns,
} from "../../globals.d";
import {
  columnsToColumnSpecs,
  columnsToNormalAndAuditColumns,
  getAllAuditColumnIds,
  getAuditColumnSpecs,
  getMergedSchemaProperties,
  getReportTypeColumnSpecs,
  getSchemasForReportTypes,
  getSelectedTypes,
  getSortColumn,
  getUnknownProperty,
  mergeColumnSpecs,
  sortColumnSpecs,
  updateAllColumnsVisibilityQuery,
  updateColumnVisibilityQuery,
  visibleAuditColumnSpecsToSelectorColumnSpecs,
  type ColumnSpec,
} from "../report";

const profiles: Profiles = {
  "@type": ["JSONschemas"],
  Award: {
    $id: "/profiles/award.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    "@type": ["JSONSchemas"],
    additionalProperties: false,
    mixinProperties: [],
    properties: {
      "@id": {
        title: "ID",
        type: "string",
      },
      uuid: {
        title: "UUID",
        type: "string",
      },
      notes: {
        title: "Notes",
        type: "string",
      },
    },
    required: [],
    title: "Grant",
    type: "object",
  },
  Lab: {
    $id: "/profiles/lab.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    "@type": ["JSONSchema"],
    additionalProperties: false,
    mixinProperties: [],
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
    required: [],
    title: "Lab",
    type: "object",
  },
  Tissue: {
    $id: "/profiles/tissue.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    "@type": ["JSONSchema"],
    additionalProperties: false,
    mixinProperties: [],
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
    required: [],
    title: "Tissue",
    type: "object",
  },
  _hierarchy: {
    Item: {
      Award: {},
      Lab: {},
      Sample: {
        Biosample: {},
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
    expect(schemas).toHaveLength(0);
  });
});

describe("Test `getSelectedTypes()`", () => {
  it("should return the correct report type for a report including a type filter", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@id": "/multireport/?type=PrimaryCell",
      "@type": ["Search"],
      "@graph": [
        {
          "@id": "/primary-cells/IGVFSM0000EEEE/",
          "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0000EEEE",
          uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
        },
      ],
      clear_filters: "/multireport/?type=PrimaryCell",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
      },
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 5,
              key: "Biosample",
            },
          ],
          title: "Object Type",
          total: 5,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "PrimaryCell",
          remove: "/multireport",
        },
      ],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Report",
      total: 5,
    };

    const types = getSelectedTypes(searchResults);
    expect(types).toHaveLength(1);
    expect(types[0]).toEqual("PrimaryCell");
  });

  it("should return the correct report types for a report including multiple type filters", () => {
    const searchResults: SearchResults = {
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
      "@type": ["Report"],
      clear_filters: "/multireport/?type=PrimaryCell",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
      },
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 5,
              key: "Biosample",
            },
          ],
          title: "Object Type",
          total: 5,
          type: "terms",
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
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Report",
      total: 5,
    };

    const reportTypes = getSelectedTypes(searchResults);
    expect(reportTypes).toHaveLength(2);
    expect(reportTypes[0]).toEqual("PrimaryCell");
    expect(reportTypes[1]).toEqual("Tissue");
  });

  it("should return the correct report types with a config filter", () => {
    const searchResults: SearchResults = {
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
      "@type": ["Report"],
      clear_filters: "/multireport/?type=PrimaryCell",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
      },
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 5,
              key: "Biosample",
            },
          ],
          title: "Object Type",
          total: 5,
          type: "terms",
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
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Report",
      total: 5,
    };

    const reportTypes = getSelectedTypes(searchResults);
    expect(reportTypes).toHaveLength(1);
    expect(reportTypes[0]).toEqual("InVitroSystem");
  });

  it("should return an empty report-type string for a report not including a type filter", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@id": "/multireport/",
      "@graph": [
        {
          "@id": "/primary-cells/IGVFSM0000EEEE/",
          "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0000EEEE",
          uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
        },
      ],
      "@type": ["Report"],
      clear_filters: "/multireport/?type=PrimaryCell",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
      },
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 5,
              key: "Biosample",
            },
          ],
          title: "Object Type",
          total: 5,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "query",
          term: "ChIP-seq",
          remove: "/multireport",
        },
      ],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Report",
      total: 5,
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
    const tissueSchema: Schema = {
      $id: "/profiles/tissue.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["JSONSchema"],
      additionalProperties: false,
      mixinProperties: [],
      properties: {
        "@id": {
          title: "ID",
          type: "string",
        },
        "@type": {
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
      required: [],
      title: "Tissue",
      type: "object",
    };

    const primaryCellSchema: Schema = {
      $id: "/profiles/primary_cell.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["JSONSchema"],
      additionalProperties: false,
      mixinProperties: [],
      properties: {
        "@id": {
          title: "ID",
          type: "string",
        },
        "@type": {
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
      required: [],
      title: "Primary Cell",
      type: "object",
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
});

describe("Test `getSortColumn()`", () => {
  it("returns the specified sorting column ID", () => {
    const searchResults: SearchResults = {
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
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 5,
              key: "Biosample",
            },
          ],
          title: "Object Type",
          total: 5,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "WholeOrganism",
          remove: "/search",
        },
      ],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Search",
      total: 1,
    };

    const sortColumn = getSortColumn(searchResults);
    expect(sortColumn).toEqual("accession");
  });

  it("returns an empty string for specified sorting column ID", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@id": "/search?type=WholeOrganism",
      "@graph": [
        {
          "@id": "/whole-organisms/IGVFSM003KAS/",
          "@type": ["WholeOrganism", "Biosample", "Sample", "Item"],
          accession: "IGVFSM003KAS",
        },
      ],
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
      facets: [
        {
          appended: false,
          field: "type",
          open_on_load: false,
          terms: [
            {
              doc_count: 5,
              key: "Biosample",
            },
          ],
          title: "Object Type",
          total: 5,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "WholeOrganism",
          remove: "/search",
        },
      ],
      notification: "Success",
      sort: {
        date_created: {
          order: "desc",
          unmapped_type: "keyword",
        },
      },
      title: "Search",
      total: 1,
    };

    const sortColumn = getSortColumn(searchResults);
    expect(sortColumn).toEqual("");
  });
});

describe("Test `sortColumnSpecs()`", () => {
  it("should return sorted columnSpecs for schema", () => {
    const columnSpecs: ColumnSpec[] = [
      { id: "accession", title: "Accession" },
      { id: "modification", title: "" },
      { id: "@id", title: "ID" },
    ];

    const sortedColumnSpecs = sortColumnSpecs(columnSpecs);
    expect(sortedColumnSpecs).toEqual([
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "modification", title: "" },
    ]);
  });
});

describe("Test `columnsToColumnSpecs()`", () => {
  it("should return sorted columnSpecs for schema", () => {
    const columns: SearchResultsColumns = {
      "@id": {
        title: "ID",
      },
      accession: {
        title: "Accession",
      },
    };

    const columnSpecs = columnsToColumnSpecs(columns);
    expect(columnSpecs).toEqual([
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
    ]);
  });
});

describe("Test `mergeColumnSpecs()`", () => {
  it("should return merged columnSpecs for multiple schemas", () => {
    const columnSpecs1: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
    ];

    const columnSpecs2: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "uuid", title: "UUID" },
    ];

    const mergedColumnSpecs = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "uuid", title: "UUID" },
    ];

    const merged = mergeColumnSpecs(columnSpecs1, columnSpecs2);
    expect(merged).toEqual(mergedColumnSpecs);
  });
});

describe("Test `getUnknownProperty()`", () => {
  it("returns the correct property values for top-level simple properties", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
    };

    let propertyValue = getUnknownProperty("accession", item);
    expect(propertyValue).toEqual(["IGVFSM0000EEEE"]);

    propertyValue = getUnknownProperty("uuid", item);
    expect(propertyValue).toEqual(["578c72a2-4f84-2c8f-96b0-ec8715e18185"]);
  });

  it("returns the correct property values for top-level complex properties", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      award: {
        "@id": "/awards/1UM1HG012077-01/",
        component: "mapping",
        contact_pi: {
          "@id": "/users/e4cadd5e-0e61-4a99-abc8-84734232e271/",
          title: "Ali Mortazavi",
        },
        title: "Center for Mouse Genomic Variation at Single Cell Resolution",
      },
    };

    let propertyValue = getUnknownProperty("award.title", item);
    expect(propertyValue).toEqual([
      "Center for Mouse Genomic Variation at Single Cell Resolution",
    ]);

    propertyValue = getUnknownProperty("award.contact_pi.title", item);
    expect(propertyValue).toEqual(["Ali Mortazavi"]);
  });

  it("returns the correct property values for arrays within embedded objects", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      donors: [
        {
          "@id": "/rodent-donors/IGVFDO1561YBFS/",
          accession: "IGVFDO1561YBFS",
          aliases: ["igvf:alias_rodent_donor_2"],
          taxa: "Mus musculus",
        },
        {
          "@id": "/rodent-donors/IGVFDO9654BNIB/",
          accession: "IGVFDO9654BNIB",
          aliases: [
            "igvf:alias_rodent_donor_1",
            "igvf:rodent_donor_with_arterial_blood_pressure_trait",
          ],
          taxa: "Mus musculus",
        },
      ],
    };

    let propertyValue = getUnknownProperty("donors.accession", item);
    expect(propertyValue).toEqual(["IGVFDO1561YBFS", "IGVFDO9654BNIB"]);

    propertyValue = getUnknownProperty("donors.aliases", item);
    expect(propertyValue).toEqual([
      "igvf:alias_rodent_donor_2",
      "igvf:alias_rodent_donor_1",
      "igvf:rodent_donor_with_arterial_blood_pressure_trait",
    ]);
  });

  it("returns the @ids of embedded objects", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      award: {
        "@id": "/awards/1UM1HG012077-01/",
        component: "mapping",
        contact_pi: {
          "@id": "/users/e4cadd5e-0e61-4a99-abc8-84734232e271/",
          title: "Ali Mortazavi",
        },
        title: "Center for Mouse Genomic Variation at Single Cell Resolution",
      },
    };

    let propertyValue = getUnknownProperty("award", item);
    expect(propertyValue).toEqual(["/awards/1UM1HG012077-01/"]);

    propertyValue = getUnknownProperty("award.contact_pi", item);
    expect(propertyValue).toEqual([
      "/users/e4cadd5e-0e61-4a99-abc8-84734232e271/",
    ]);
  });

  it("returns the @ids of embedded arrays of objects", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      donors: [
        {
          "@id": "/rodent-donors/IGVFDO1561YBFS/",
          accession: "IGVFDO1561YBFS",
          aliases: ["igvf:alias_rodent_donor_2"],
          taxa: "Mus musculus",
        },
        {
          "@id": "/rodent-donors/IGVFDO9654BNIB/",
          accession: "IGVFDO9654BNIB",
          aliases: [
            "igvf:alias_rodent_donor_1",
            "igvf:rodent_donor_with_arterial_blood_pressure_trait",
          ],
          taxa: "Mus musculus",
        },
      ],
    };

    const propertyValue = getUnknownProperty("donors", item);
    expect(propertyValue).toEqual([
      "/rodent-donors/IGVFDO1561YBFS/",
      "/rodent-donors/IGVFDO9654BNIB/",
    ]);
  });

  it("returns JSON strings for complex objects", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      award: {
        "@id": "/awards/1UM1HG012077-01/",
        component: "mapping",
        contact_pi: {
          name: "ali-mortazavi",
          title: "Ali Mortazavi",
        },
        title: "Center for Mouse Genomic Variation at Single Cell Resolution",
      },
    };

    const propertyValue = getUnknownProperty("award.contact_pi", item);
    expect(propertyValue).toEqual([
      '{"name":"ali-mortazavi","title":"Ali Mortazavi"}',
    ]);
  });

  it("returns an empty string for a non-existent top-level property", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
    };

    const propertyValue = getUnknownProperty("alternate_accessions", item);
    expect(propertyValue).toEqual([]);
  });

  it("returns an empty string for a non-existent embedded property", () => {
    const item: DatabaseObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      award: {
        "@id": "/awards/1UM1HG012077-01/",
        component: "mapping",
        contact_pi: {
          "@id": "/users/e4cadd5e-0e61-4a99-abc8-84734232e271/",
          title: "Ali Mortazavi",
        },
        title: "Center for Mouse Genomic Variation at Single Cell Resolution",
      },
    };

    const propertyValue = getUnknownProperty("award.contact_pi.name", item);
    expect(propertyValue).toEqual([]);
  });
});

describe("Test updateColumnVisibilityQuery()", () => {
  it("adds and removes a field from the query string with existing field=", () => {
    const defaultColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
    ];

    // Add `alternate_accessions` field to query string with a field= in it already.
    let updatedQuery = updateColumnVisibilityQuery(
      "type=InVitroSystem&field=%40id",
      "alternate_accessions",
      false,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=%40id&field=alternate_accessions"
    );

    // Remove `alternate_accessions` field from query string with a field= in it already.
    updatedQuery = updateColumnVisibilityQuery(
      updatedQuery,
      "alternate_accessions",
      true,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual("type=InVitroSystem&field=%40id");
  });

  it("adds and removes a field from the query string with no existing field=", () => {
    const defaultColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
    ];

    // Add `alternate_accessions` field to query string without a field= in it already.
    let updatedQuery = updateColumnVisibilityQuery(
      "type=InVitroSystem",
      "alternate_accessions",
      false,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=%40id&field=accession&field=alternate_accessions"
    );

    // Remove `alternate_accessions` field from query string without a field= in it already.
    updatedQuery = updateColumnVisibilityQuery(
      updatedQuery,
      "alternate_accessions",
      true,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual("type=InVitroSystem");
  });

  it("adds and removes a field from the query string with an existing field= but no @id field", () => {
    const defaultColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
    ];

    // Add `alternate_accessions` field to query string without a field= in it already.
    let updatedQuery = updateColumnVisibilityQuery(
      "type=InVitroSystem&field=accession",
      "alternate_accessions",
      false,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=accession&field=alternate_accessions&field=%40id"
    );

    // Remove `alternate_accessions` field from query string without a field= in it already.
    updatedQuery = updateColumnVisibilityQuery(
      updatedQuery,
      "alternate_accessions",
      true,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual("type=InVitroSystem");
  });

  it("adds and removes audit properties from the query string", () => {
    const defaultColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "audit.ERROR.path", title: "audit.ERROR.path" },
      { id: "audit.ERROR.detail", title: "audit.ERROR.detail" },
    ];

    // Add audit properties to query string.
    let updatedQuery = updateColumnVisibilityQuery(
      "type=InVitroSystem",
      "audit.ERROR",
      false,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=%40id&field=accession&field=audit.ERROR.path&field=audit.ERROR.detail&field=audit.ERROR.category"
    );

    // Remove audit properties from query string.
    updatedQuery = updateColumnVisibilityQuery(
      updatedQuery,
      "audit.ERROR",
      true,
      defaultColumnSpecs
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=%40id&field=accession"
    );
  });
});

describe("Test updateAllColumnsVisibilityQuery()", () => {
  it("adds all columns to the query string", () => {
    const allColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "alternate_accessions", title: "Alternate Accessions" },
      { id: "summary", title: "Summary" },
      { id: "uuid", title: "UUID" },
    ];
    const visibleColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "alternate_accessions", title: "Alternate Accessions" },
      { id: "summary", title: "Summary" },
    ];

    // Add all columns to the query string.
    let updatedQuery = updateAllColumnsVisibilityQuery(
      "type=InVitroSystem",
      true,
      allColumnSpecs,
      visibleColumnSpecs
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=%40id&field=alternate_accessions&field=summary&field=accession&field=uuid"
    );

    // Remove all columns from the query string.
    updatedQuery = updateAllColumnsVisibilityQuery(
      updatedQuery,
      false,
      allColumnSpecs,
      visibleColumnSpecs
    );
    expect(updatedQuery).toEqual("type=InVitroSystem&field=%40id");
  });

  it("adds all columns except those that overflow the limit to the query string", () => {
    const allColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "accession", title: "Accession" },
      { id: "alternate_accessions", title: "Alternate Accessions" },
      { id: "summary", title: "Summary" },
      { id: "uuid", title: "UUID" },
    ];
    const visibleColumnSpecs: ColumnSpec[] = [
      { id: "@id", title: "ID" },
      { id: "alternate_accessions", title: "Alternate Accessions" },
      { id: "summary", title: "Summary" },
    ];

    // Add all columns to the query string.
    const updatedQuery = updateAllColumnsVisibilityQuery(
      "type=InVitroSystem",
      true,
      allColumnSpecs,
      visibleColumnSpecs,
      3
    );
    expect(updatedQuery).toEqual(
      "type=InVitroSystem&field=%40id&field=alternate_accessions&field=summary"
    );
  });
});

describe("Test audit-specific functions", () => {
  test("getAuditColumnSpecs() returns the correct audit columns specs", () => {
    const loggedOutColumnSpecs = getAuditColumnSpecs(false);
    expect(loggedOutColumnSpecs).toEqual([
      {
        id: "audit.ERROR",
        title: "Error",
      },
      {
        id: "audit.WARNING",
        title: "Warning",
      },
      {
        id: "audit.NOT_COMPLIANT",
        title: "Not Compliant",
      },
    ]);

    const loggedInColumnSpecs = getAuditColumnSpecs(true);
    expect(loggedInColumnSpecs).toEqual([
      {
        id: "audit.ERROR",
        title: "Error",
      },
      {
        id: "audit.WARNING",
        title: "Warning",
      },
      {
        id: "audit.NOT_COMPLIANT",
        title: "Not Compliant",
      },
      {
        id: "audit.INTERNAL_ACTION",
        title: "Internal Action",
      },
    ]);
  });

  test("getAllAuditColumnIds() returns the correct audit column IDs", () => {
    const auditColumnSpecs = getAuditColumnSpecs(false);
    const columnIds = getAllAuditColumnIds(auditColumnSpecs);
    expect(columnIds).toEqual([
      "audit.ERROR.path",
      "audit.ERROR.detail",
      "audit.ERROR.category",
      "audit.WARNING.path",
      "audit.WARNING.detail",
      "audit.WARNING.category",
      "audit.NOT_COMPLIANT.path",
      "audit.NOT_COMPLIANT.detail",
      "audit.NOT_COMPLIANT.category",
    ]);
  });

  test("columnsToNormalAndAuditColumnSpecs() returns the correct column specs", () => {
    const searchResultColumns: SearchResultsColumns = {
      "@id": { title: "ID" },
      accession: { title: "Accession" },
      "audit.ERROR.path": { title: "audit.ERROR.path" },
      "audit.ERROR.detail": { title: "audit.ERROR.detail" },
      "audit.ERROR.category": { title: "audit.ERROR.category" },
    };
    const results = columnsToNormalAndAuditColumns(searchResultColumns);
    expect(Object.keys(results)).toHaveLength(2);
    expect(results.visibleColumns).toEqual({
      "@id": { title: "ID" },
      accession: { title: "Accession" },
    });
    expect(results.visibleAuditColumns).toEqual({
      "audit.ERROR.path": { title: "audit.ERROR.path" },
      "audit.ERROR.detail": { title: "audit.ERROR.detail" },
      "audit.ERROR.category": { title: "audit.ERROR.category" },
    });
  });

  describe("visibleAuditColumnSpecsToSelectorColumnSpecs() returns correct column specs", () => {
    it("returns correct column specs for a complete set of audit specs for ERROR", () => {
      const visibleAuditColumnSpecs = [
        { id: "audit.ERROR.category", title: "audit.ERROR.category" },
        { id: "audit.ERROR.detail", title: "audit.ERROR.detail" },
        { id: "audit.ERROR.path", title: "audit.ERROR.path" },
      ];
      const auditColumnSpecs = getAuditColumnSpecs(false);

      const selectorColumnSpecs = visibleAuditColumnSpecsToSelectorColumnSpecs(
        visibleAuditColumnSpecs,
        auditColumnSpecs
      );

      expect(selectorColumnSpecs).toEqual([
        { id: "audit.ERROR", title: "Error" },
      ]);
    });

    it("returns correct column specs with one complete and one partial set of audit specs", () => {
      const visibleAuditColumnSpecs = [
        { id: "audit.ERROR.category", title: "audit.ERROR.category" },
        { id: "audit.ERROR.detail", title: "audit.ERROR.detail" },
        { id: "audit.WARNING.category", title: "audit.WARNING.category" },
        { id: "audit.WARNING.detail", title: "audit.WARNING.detail" },
        { id: "audit.WARNING.path", title: "audit.WARNING.path" },
      ];
      const auditColumnSpecs = getAuditColumnSpecs(false);

      const selectorColumnSpecs = visibleAuditColumnSpecsToSelectorColumnSpecs(
        visibleAuditColumnSpecs,
        auditColumnSpecs
      );

      expect(selectorColumnSpecs).toEqual([
        { id: "audit.WARNING", title: "Warning" },
      ]);
    });

    it("returns correct column specs with a complete set of audit specs including a duplicate", () => {
      const visibleAuditColumnSpecs = [
        { id: "audit.ERROR.category", title: "audit.ERROR.category" },
        { id: "audit.ERROR.detail", title: "audit.ERROR.detail" },
        { id: "audit.ERROR.path", title: "audit.ERROR.path" },
        { id: "audit.ERROR.category", title: "audit.ERROR.category" },
      ];
      const auditColumnSpecs = getAuditColumnSpecs(false);

      const selectorColumnSpecs = visibleAuditColumnSpecsToSelectorColumnSpecs(
        visibleAuditColumnSpecs,
        auditColumnSpecs
      );

      expect(selectorColumnSpecs).toEqual([
        { id: "audit.ERROR", title: "Error" },
      ]);
    });
  });
});
