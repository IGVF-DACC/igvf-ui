// libs
import {
  checkSearchTermSchema,
  checkSearchTermTitle,
  getProfiles,
} from "../profiles";

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

    getProfiles({ _csfrt_: "mocktoken" }).then((data) => {
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
  const schemaProps = {
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
