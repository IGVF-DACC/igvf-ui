// libs
import {
  checkSearchTermSchema,
  checkSearchTermTitle,
  getProfiles,
  notSubmittableProperty,
  schemaPageTabUrl,
  schemaToPath,
  schemaToType,
  typeToRootType,
} from "../profiles";
// types
import {
  Profiles,
  Schema,
  SchemaProperties,
  SchemaProperty,
} from "../../globals";

describe("Test getProfiles functionality", () => {
  it("retrieves the schema profiles object", () => {
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

    getProfiles().then((data) => {
      expect(data).toEqual(mockData);
    });
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

  it("returns an empty string with no schema page URL", () => {
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

    const result = schemaToType(schema, {});
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
