// libs
import {
  checkSearchTermSchema,
  checkSearchTermTitle,
  getProfiles,
  extractSchema,
  isSchema,
  notSubmittableProperty,
  schemaNameToCollectionName,
  schemaPageTabUrl,
  schemaToPath,
  schemaToType,
  typeToRootType,
} from "../profiles";
// types
import {
  CollectionTitles,
  Profiles,
  Schema,
  SchemaProperties,
  SchemaProperty,
} from "../../globals";

describe("Test getProfiles functionality", () => {
  it("retrieves the schema profiles object", async () => {
    const mockData = {
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      description: "Derived schema submitting human donors.",
      type: "object",
      properties: {
        taxa: {
          title: "Taxa",
          type: "string",
          enum: ["Homo sapiens"],
        },
      },
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const data = await getProfiles();
    expect(data).toEqual(mockData);
  });
});

describe("Test the checkSearchTermTitle", () => {
  it("returns false if the search term doesn't exist in the title", () => {
    const result = checkSearchTermTitle(
      "nonexistent",
      "Phenotype Ontology Terms"
    );
    expect(result).toBeFalsy();
  });

  it("returns true if the search term does exist in the title", () => {
    const result = checkSearchTermTitle("ontology", "Phenotype Ontology Terms");
    expect(result).toBeTruthy();
  });

  it("returns false with no search term", () => {
    const result = checkSearchTermTitle("", "Phenotype Ontology Term");
    expect(result).toBeFalsy();
  });
});

describe("Test the checkSearchTermSchemas function", () => {
  const schemaProps: SchemaProperties = {
    "@id": {
      title: "ID",
      type: "string",
    },
    "@type": {
      items: {
        title: "Type Items",
        type: "string",
      },
      title: "Type",
      type: "array",
    },
    aliases: {
      items: {
        title: "Lab Alias",
        type: "string",
      },
      title: "Aliases",
      type: "array",
    },
    component: {
      enum: ["affiliate", "data analysis", "predictive modeling"],
      title: "Project Component",
      type: "string",
    },
    analysis_step_types: {
      title: "Analysis Step Types",
      type: "array",
      items: {
        title: "Type",
        type: "string",
        enum: ["alignment", "file format conversion", "signal generation"],
      },
    },
    input_content_types: {
      title: "Input Content Types",
      type: "array",
      items: {
        title: "Input Content Type",
        type: "string",
        anyOf: [
          {
            enum: ["alignments", "transcriptome alignments"],
          },
          {
            enum: ["seqspec"],
          },
          {
            enum: [
              "contact matrix",
              "sparse gene count matrix",
              "sparse peak count matrix",
            ],
          },
          {
            enum: ["biological_context", "complexes", "complexes_complexes"],
          },
          {
            enum: ["reads", "subreads"],
          },
          {
            enum: ["signal", "signal of all reads", "signal of unique reads"],
          },
          {
            oneOf: [
              {
                enum: [
                  "biological_context",
                  "complexes",
                  "complexes_complexes",
                  "complexes_proteins",
                ],
              },
            ],
          },
        ],
      },
    },
    loci: {
      title: "Loci",
      type: "array",
      items: {
        title: "Locus",
        type: "object",
        properties: {
          assembly: {
            title: "Mapping assembly",
            type: "string",
            enum: ["GRCh38", "hg19", "GRCm39"],
          },
          chromosome: {
            title: "Chromosome",
            type: "string",
          },
          start: {
            title: "Start",
            type: "integer",
          },
          end: {
            title: "End",
            type: "integer",
          },
        },
      },
    },
  };

  it("returns false with no matching property", () => {
    const results = checkSearchTermSchema("unknown", schemaProps);
    expect(results).toBeFalsy();
  });

  it("finds a matching property name", () => {
    const results = checkSearchTermSchema("aliases", schemaProps);
    expect(results).toBeTruthy();
  });

  it("finds a matching property title", () => {
    const results = checkSearchTermSchema("project component", schemaProps);
    expect(results).toBeTruthy();
  });

  it("finds a matching enum value", () => {
    const results = checkSearchTermSchema("data analysis", schemaProps);
    expect(results).toBeTruthy();
  });

  it("finds a matching embedded item title", () => {
    const results = checkSearchTermSchema("lab alias", schemaProps);
    expect(results).toBeTruthy();
  });

  it("finds a matching embedded item enum value", () => {
    const results = checkSearchTermSchema("alignment", schemaProps);
    expect(results).toBeTruthy();
  });

  it("finds a matching embedded item anyOf value", () => {
    const results = checkSearchTermSchema(
      "sparse peak count matrix",
      schemaProps
    );
    expect(results).toBeTruthy();
  });

  it("finds a matching embedded oneOf value", () => {
    const results = checkSearchTermSchema("complexes_proteins", schemaProps);
    expect(results).toBeTruthy();
  });

  it("finds a matching embedded item properties", () => {
    const results = checkSearchTermSchema("mapping assembly", schemaProps);
    expect(results).toBeTruthy();
  });

  it("returns false with no search term", () => {
    const results = checkSearchTermSchema("", schemaProps);
    expect(results).toBeFalsy();
  });

  it("finds a match with a property name", () => {
    const results = checkSearchTermSchema(
      "complexes_complexes",
      schemaProps,
      "input_content_types"
    );
    expect(results).toBeTruthy();
  });

  it("doesn't find a match with a property name", () => {
    const results = checkSearchTermSchema(
      "loci",
      schemaProps,
      "input_content_types"
    );
    expect(results).toBeFalsy();
  });

  it("doesn't find a match with an incorrect property name", () => {
    const results = checkSearchTermSchema("loci", schemaProps, "nonexistent");
    expect(results).toBeFalsy();
  });
});

describe("Test the notSubmittableProperty function", () => {
  it("returns false for a submittable property", () => {
    const property: SchemaProperty = {
      title: "ID",
      type: "string",
    };
    const result = notSubmittableProperty(property);
    expect(result).toBeFalsy();
  });

  it("returns true for a non-submittable property", () => {
    const propertyNotSubmittable: SchemaProperty = {
      title: "ID",
      type: "string",
      notSubmittable: true,
    };
    const propertyReadonly: SchemaProperty = {
      title: "ID",
      type: "string",
      readonly: true,
    };
    const propertyPermission: SchemaProperty = {
      title: "ID",
      type: "string",
      permission: "import_items",
    };

    expect(notSubmittableProperty(propertyNotSubmittable)).toBeTruthy();
    expect(notSubmittableProperty(propertyReadonly)).toBeTruthy();
    expect(notSubmittableProperty(propertyPermission)).toBeTruthy();
  });
});

describe("Test the schemaPageTabUrl function", () => {
  it("returns the correct URL for the schema page tab", () => {
    const url = schemaPageTabUrl("https://data-provider.org/", "schema");
    expect(url).toBe("https://data-provider.org/schema/");
  });

  it("returns an empty string with no schema page URL", () => {
    const url = schemaPageTabUrl(null, "schema");
    expect(url).toBe("");
  });

  it("returns an empty string with an empty schema page URL", () => {
    const url = schemaPageTabUrl("", "schema");
    expect(url).toBe("");
  });
});

describe("Test the schemaToType function", () => {
  it("finds the correct schema type", () => {
    const schema: Schema = {
      "@type": ["JSONSchema"],
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      additionalProperties: false,
      description: "Derived schema submitting human donors.",
      required: ["award", "lab", "taxa"],
      type: "object",
      mixinProperties: [
        {
          $ref: "donor.json#/properties",
        },
      ],
      properties: {
        "@id": {
          notSubmittable: true,
          title: "ID",
          type: "string",
        },
        "@type": {
          notSubmittable: true,
          title: "Type",
          type: "array",
        },
      },
    };

    const profiles: Profiles = {
      "@type": ["JSONSchemas"],
      _hierarchy: { Item: {} },
      _subtypes: {},
      HumanDonor: {
        "@type": ["JSONSchema"],
        title: "Human Donor",
        $id: "/profiles/human_donor.json",
        $schema: "https://json-schema.org/draft/2020-12/schema",
        additionalProperties: false,
        description: "Derived schema submitting human donors.",
        required: ["award", "lab", "taxa"],
        type: "object",
        mixinProperties: [
          {
            $ref: "donor.json#/properties",
          },
        ],
        properties: {
          "@id": {
            notSubmittable: true,
            title: "ID",
            type: "string",
          },
          "@type": {
            notSubmittable: true,
            title: "Type",
            type: "array",
          },
        },
      },
    };

    const result = schemaToType(schema, profiles);
    expect(result).toBe("HumanDonor");
  });

  it("returns an empty string for an unknown schema path", () => {
    const schema: Schema = {
      "@type": ["JSONSchema"],
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      additionalProperties: false,
      description: "Derived schema submitting human donors.",
      required: ["award", "lab", "taxa"],
      type: "object",
      mixinProperties: [
        {
          $ref: "donor.json#/properties",
        },
      ],
      properties: {
        "@id": {
          notSubmittable: true,
          title: "ID",
          type: "string",
        },
        "@type": {
          notSubmittable: true,
          title: "Type",
          type: "array",
        },
      },
    };

    const profiles: Profiles = {
      "@type": ["JSONSchemas"],
      _hierarchy: { Item: {} },
      _subtypes: {},
      RodentDonor: {
        "@type": ["JSONSchema"],
        title: "Rodent Donor",
        $id: "/profiles/rodent_donor.json",
        $schema: "https://json-schema.org/draft/2020-12/schema",
        additionalProperties: false,
        description: "Derived schema submitting rodent donors.",
        required: ["award", "lab", "taxa"],
        type: "object",
        mixinProperties: [
          {
            $ref: "donor.json#/properties",
          },
        ],
        properties: {
          "@id": {
            notSubmittable: true,
            title: "ID",
            type: "string",
          },
          "@type": {
            notSubmittable: true,
            title: "Type",
            type: "array",
          },
        },
      },
    };

    const result = schemaToType(schema, profiles);
    expect(result).toBe("");
  });

  it("returns an empty string with no profiles", () => {
    const schema: Schema = {
      "@type": ["JSONSchema"],
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      additionalProperties: false,
      description: "Derived schema submitting human donors.",
      required: ["award", "lab", "taxa"],
      type: "object",
      mixinProperties: [
        {
          $ref: "donor.json#/properties",
        },
      ],
      properties: {
        "@id": {
          notSubmittable: true,
          title: "ID",
          type: "string",
        },
        "@type": {
          notSubmittable: true,
          title: "Type",
          type: "array",
        },
      },
    };

    const result = schemaToType(schema, {
      "@type": ["JSONSchemas"],
      _hierarchy: { Item: {} },
      _subtypes: {},
    });
    expect(result).toBe("");
  });
});

describe("Test the schemaToPath function", () => {
  it("generates the correct path for the schema", () => {
    const schema: Schema = {
      "@type": ["JSONSchema"],
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      additionalProperties: false,
      description: "Derived schema submitting human donors.",
      required: ["award", "lab", "taxa"],
      type: "object",
      mixinProperties: [
        {
          $ref: "donor.json#/properties",
        },
      ],
      properties: {
        "@id": {
          notSubmittable: true,
          title: "ID",
          type: "string",
        },
        "@type": {
          notSubmittable: true,
          title: "Type",
          type: "array",
        },
      },
    };

    const result = schemaToPath(schema);
    expect(result).toBe("/profiles/human_donor");
  });
});

describe("Test typeToRootType functionality", () => {
  const mockProfiles = {
    _hierarchy: {
      Item: {
        Sample: {
          Biosample: {
            InVitroSystem: {},
            PrimaryCell: {},
          },
          MultiplexedSample: {},
          TechnicalSample: {},
        },
        Gene: {},
      },
    },
  } as any;

  it("should return root parent for deeply nested type", () => {
    const result = typeToRootType("InVitroSystem", mockProfiles);
    expect(result).toBe("Sample");
  });

  it("should return root parent for intermediate nested type", () => {
    const result = typeToRootType("Biosample", mockProfiles);
    expect(result).toBe("Sample");
  });

  it("should return root parent for first-level nested type", () => {
    const result = typeToRootType("MultiplexedSample", mockProfiles);
    expect(result).toBe("Sample");
  });

  it("should return itself for root-level type", () => {
    const result = typeToRootType("Sample", mockProfiles);
    expect(result).toBe("Sample");
  });

  it("should return itself for another root-level type", () => {
    const result = typeToRootType("Gene", mockProfiles);
    expect(result).toBe("Gene");
  });

  it("should return empty string for non-existent type", () => {
    const result = typeToRootType("NonExistentType", mockProfiles);
    expect(result).toBe("");
  });

  it("should handle empty hierarchy", () => {
    const emptyProfiles = { _hierarchy: { Item: {} } } as any;
    const result = typeToRootType("AnyType", emptyProfiles);
    expect(result).toBe("");
  });

  it("should return root parent for deeply nested hierarchy", () => {
    const deepProfiles = {
      _hierarchy: {
        Item: {
          Root: {
            Level1: {
              Level2: {
                Level3: {
                  Level4: {},
                },
              },
            },
          },
        },
      },
    } as any;
    const result = typeToRootType("Level4", deepProfiles);
    expect(result).toBe("Root");
  });

  it("should return empty string when profiles is empty", () => {
    const result = typeToRootType("Level4", null);
    expect(result).toBe("");
  });
});

describe("Test schemaNameToCollectionName functionality", () => {
  const mockCollectionTitles = {
    "@type": ["CollectionTitles"],
    Tissue: "Tissues",
    tissue: "Tissues",
    tissues: "Tissues",
    InVitroSystem: "In Vitro Systems",
    in_vitro_system: "In Vitro Systems",
    "in-vitro-systems": "In Vitro Systems",
    SingleCellAtacSeqQualityMetric: "Single Cell ATAC-seq Quality Metrics",
    single_cell_atac_seq_quality_metric: "Single Cell ATAC-seq Quality Metrics",
    "single-cell-atac-seq-quality-metrics":
      "Single Cell ATAC-seq Quality Metrics",
    Gene: "Genes",
    gene: "Genes",
    genes: "Genes",
  } as unknown as CollectionTitles;

  it("should return collection name for a schema name (tissue example)", () => {
    const result = schemaNameToCollectionName("tissue", mockCollectionTitles);
    expect(result).toBe("tissues");
  });

  it("should return collection name for a schema name (in_vitro_system example)", () => {
    const result = schemaNameToCollectionName(
      "in_vitro_system",
      mockCollectionTitles
    );
    expect(result).toBe("in-vitro-systems");
  });

  it("should return collection name for a schema name (single_cell_atac_seq_quality_metric example)", () => {
    const result = schemaNameToCollectionName(
      "single_cell_atac_seq_quality_metric",
      mockCollectionTitles
    );
    expect(result).toBe("single-cell-atac-seq-quality-metrics");
  });

  it("should return collection name when schema name is PascalCase", () => {
    const result = schemaNameToCollectionName(
      "InVitroSystem",
      mockCollectionTitles
    );
    expect(result).toBe("in_vitro_system");
  });

  it("should return empty string when collection name is the same as schema name", () => {
    const singleMatchTitles = {
      "@type": ["CollectionTitles"],
      tissue: "Tissues",
    } as unknown as CollectionTitles;
    const result = schemaNameToCollectionName("tissue", singleMatchTitles);
    expect(result).toBe("");
  });

  it("should return empty string when schema name not found in collectionTitles", () => {
    const result = schemaNameToCollectionName(
      "nonexistent",
      mockCollectionTitles
    );
    expect(result).toBe("");
  });

  it("should return empty string when collectionTitles is empty", () => {
    const emptyTitles = {
      "@type": ["CollectionTitles"],
    } as unknown as CollectionTitles;
    const result = schemaNameToCollectionName("tissue", emptyTitles);
    expect(result).toBe("");
  });

  it("should return empty string when collectionTitles is null", () => {
    const result = schemaNameToCollectionName("tissue", null as any);
    expect(result).toBe("");
  });

  it("should return empty string when collectionTitles is undefined", () => {
    const result = schemaNameToCollectionName("tissue", undefined as any);
    expect(result).toBe("");
  });

  it("should prioritize lowercase non-PascalCase collection names", () => {
    const titlesWithMultiple = {
      "@type": ["CollectionTitles"],
      Gene: "Genes",
      gene: "Genes",
      genes: "Genes",
      GENES: "Genes",
    } as unknown as CollectionTitles;
    const result = schemaNameToCollectionName("gene", titlesWithMultiple);
    expect(result).toBe("genes");
  });

  it("should filter out @type key from matching collections", () => {
    const titlesWithType = {
      "@type": ["Test"],
      tissue: "Test",
      tissues: "Test",
    } as unknown as CollectionTitles;
    const result = schemaNameToCollectionName("tissue", titlesWithType);
    expect(result).toBe("tissues");
  });

  it("should return first non-uppercase match when multiple valid matches exist", () => {
    const result = schemaNameToCollectionName("gene", mockCollectionTitles);
    expect(result).toBe("genes");
  });
});

describe("Test isSchema type guard", () => {
  it("should return true for valid schema with all required fields", () => {
    const validSchema = {
      $id: "/profiles/test.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      "@type": ["JSONSchema"],
      properties: {
        name: { type: "string" },
      },
    };
    expect(isSchema(validSchema)).toBe(true);
  });

  it("should return true for minimal schema with only properties", () => {
    const minimalSchema = {
      properties: {
        name: { type: "string" },
      },
    };
    expect(isSchema(minimalSchema)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isSchema(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isSchema(undefined)).toBe(false);
  });

  it("should return false for non-object types", () => {
    expect(isSchema("string")).toBe(false);
    expect(isSchema(123)).toBe(false);
    expect(isSchema(true)).toBe(false);
  });

  it("should return false for object without properties", () => {
    expect(isSchema({ $id: "/test.json" })).toBe(false);
  });

  it("should return false for object with null properties", () => {
    expect(isSchema({ properties: null })).toBe(false);
  });

  it("should return false when $id is not a string", () => {
    const invalidSchema = {
      $id: 123,
      properties: {},
    };
    expect(isSchema(invalidSchema)).toBe(false);
  });

  it("should return false when $schema is not a string", () => {
    const invalidSchema = {
      $schema: true,
      properties: {},
    };
    expect(isSchema(invalidSchema)).toBe(false);
  });

  it("should return false when @type is not an array", () => {
    const invalidSchema = {
      "@type": "JSONSchema",
      properties: {},
    };
    expect(isSchema(invalidSchema)).toBe(false);
  });
});

describe("Test extractSchema function", () => {
  const mockProfiles: Profiles = {
    "@type": ["JSONSchemas"],
    _hierarchy: { Item: {} },
    _subtypes: {},
    HumanDonor: {
      "@type": ["JSONSchema"],
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      properties: {
        "@id": {
          title: "ID",
          type: "string",
        },
      },
    },
    TestSchema: {
      properties: {
        name: { type: "string" },
      },
    },
  };

  it("should return schema when type exists and is valid", () => {
    const result = extractSchema(mockProfiles, "HumanDonor");
    expect(result).toBeDefined();
    expect(result?.title).toBe("Human Donor");
  });

  it("should return schema for minimal valid schema", () => {
    const result = extractSchema(mockProfiles, "TestSchema");
    expect(result).toBeDefined();
    expect(result?.properties).toBeDefined();
  });

  it("should return null when type does not exist", () => {
    const result = extractSchema(mockProfiles, "NonExistent");
    expect(result).toBeNull();
  });

  it("should return null when profiles is null", () => {
    const result = extractSchema(null, "HumanDonor");
    expect(result).toBeNull();
  });

  it("should return null when profiles is undefined", () => {
    const result = extractSchema(undefined, "HumanDonor");
    expect(result).toBeNull();
  });

  it("should return null when value at type is not a valid schema", () => {
    const invalidProfiles = {
      "@type": ["JSONSchemas"],
      _hierarchy: { Item: {} },
      _subtypes: {},
      InvalidType: "not a schema",
    } as unknown as Profiles;
    const result = extractSchema(invalidProfiles, "InvalidType");
    expect(result).toBeNull();
  });

  it("should return null when accessing special keys", () => {
    const result = extractSchema(mockProfiles, "@type");
    expect(result).toBeNull();
  });
});
