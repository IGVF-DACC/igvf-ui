import type {
  Profiles,
  Schema,
  SearchResults,
  SearchResultsObject,
  SearchResultsColumns,
} from "../../globals.d";
import {
  columnsToColumnSpecs,
  getMergedSchemaProperties,
  getReportTypeColumnSpecs,
  getSchemasForReportTypes,
  getSelectedTypes,
  getSortColumn,
  getUnknownProperty,
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

describe("Test `getUnknownProperty()`", () => {
  it("handles simple types in embedded objects", () => {
    const result: SearchResultsObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      min: 1,
      virtual: false,
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      embedded: {
        accession: "IGVFSM0000EEEE",
        min: 1,
        virtual: false,
        uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      },
    };

    let unknownProperty = getUnknownProperty("embedded.accession", result);
    expect(unknownProperty).toEqual("IGVFSM0000EEEE");

    unknownProperty = getUnknownProperty("embedded.min", result);
    expect(unknownProperty).toEqual(1);

    unknownProperty = getUnknownProperty("embedded.virtual", result);
    expect(unknownProperty).toEqual(false);
  });

  it("handles an embedded objects with @ids", () => {
    const result: SearchResultsObject = {
      "@id": "/auxiliary-sets/IGVFDS0001AUXI/",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
      accession: "IGVFDS0001AUXI",
      award: {
        "@id": "/awards/1UM1HG012077-01/",
        component: "mapping",
        contact_pi: {
          "@id": "/users/e4cadd5e-0e61-4a99-abc8-84734232e271/",
          title: "Ali Mortazavi",
        },
        title: "Center for Mouse Genomic Variation at Single Cell Resolution",
      },
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
      samples: [
        {
          "@id": "/tissues/IGVFSM0001DDDD/",
          accession: "IGVFSM0001DDDD",
          aliases: ["igvf:treated_tissue"],
          classification: "tissue",
          sample_terms: [
            {
              "@id": "/sample-terms/UBERON_0002048/",
              summary: "eea050cd-9e8c-4420-967f-3581b20536ab",
              term_name: "lung",
            },
          ],
          summary:
            "lung tissue, mixed sex, Mus musculus some name (10-20 weeks) treated with 10 μg/mL resorcinol for 30 minutes, 100 μg/kg new compound for 30 minutes",
          taxa: "Mus musculus",
          treatments: [
            "/treatments/2d57c810-c729-11ec-9d64-0242ac120002/",
            "/treatments/4fbb0dc2-c72e-11ec-9d64-0242ac120002/",
          ],
        },
      ],
      status: "released",
      uuid: "f0c5cba2-ed42-4dae-91dc-4bfd55a11c5b",
    };

    let unknownProperty = getUnknownProperty("award.contact_pi", result);
    expect(unknownProperty).toEqual({
      "@id": "/users/e4cadd5e-0e61-4a99-abc8-84734232e271/",
      title: "Ali Mortazavi",
    });

    unknownProperty = getUnknownProperty("donors", result);
    expect(unknownProperty).toEqual([
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
    ]);

    unknownProperty = getUnknownProperty("donors.aliases", result);
    expect(unknownProperty).toEqual([
      "igvf:alias_rodent_donor_2",
      "igvf:alias_rodent_donor_1",
      "igvf:rodent_donor_with_arterial_blood_pressure_trait",
    ]);

    unknownProperty = getUnknownProperty("samples.sample_terms", result);
    expect(unknownProperty).toEqual([
      {
        "@id": "/sample-terms/UBERON_0002048/",
        summary: "eea050cd-9e8c-4420-967f-3581b20536ab",
        term_name: "lung",
      },
    ]);

    unknownProperty = getUnknownProperty(
      "samples.sample_terms.summary",
      result
    );
    expect(unknownProperty).toEqual(["eea050cd-9e8c-4420-967f-3581b20536ab"]);
  });

  it("handles a non-existent property", () => {
    const result: SearchResultsObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      min: 1,
      virtual: false,
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      embedded: {
        accession: "IGVFSM0000EEEE",
        min: 1,
        virtual: false,
        uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      },
    };

    const unknownProperty = getUnknownProperty("embedded.max", result);
    expect(unknownProperty).toBeUndefined();
  });
});
