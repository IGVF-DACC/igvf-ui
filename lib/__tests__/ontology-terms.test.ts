// lib
import FetchRequest from "../fetch-request";
import {
  getAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
  getAssayTitleDescription,
  getMeasurementSetAssayTitleDescriptionMap,
  AssayTermObject,
} from "../ontology-terms";
// root
import { FileSetObject, OntologyTermObject, Profiles } from "../../globals";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("ontology-terms", () => {
  let request: FetchRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetch.mockReset();
    request = new FetchRequest();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper to create consistent mock responses
   */
  function createMockResponse(data: any): Response {
    return {
      ok: true,
      json: jest.fn().mockResolvedValue(data),
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      redirected: false,
      type: "basic",
      url: "",
    } as unknown as Response;
  }

  describe("getAssayTitleDescriptionMap", () => {
    it("should return a map of assay titles to descriptions for successful response", async () => {
      const mockAssayTerms: AssayTermObject[] = [
        {
          "@id": "/assay-terms/OBI_0000185/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0000185",
          term_name: "imaging assay",
          definition: "An assay that produces a picture of an entity.",
        },
        {
          "@id": "/assay-terms/OBI_0003659/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0003659",
          term_name: "in vitro CRISPR screen assay",
          definition:
            "An assay in which cells expressing a Cas system are infected with a library of guide RNAs with the intent of causing a perturbation at the target of the guide RNAs.",
        },
      ];

      const mockResponse = {
        "@graph": mockAssayTerms,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await getAssayTitleDescriptionMap(
        ["imaging assay", "in vitro CRISPR screen assay"],
        request
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/search-quick/?type=AssayTerm&field=term_name&field=definition&term_name=imaging%20assay&term_name=in%20vitro%20CRISPR%20screen%20assay",
        expect.anything()
      );
      expect(result).toEqual({
        "imaging assay": "An assay that produces a picture of an entity.",
        "in vitro CRISPR screen assay":
          "An assay in which cells expressing a Cas system are infected with a library of guide RNAs with the intent of causing a perturbation at the target of the guide RNAs.",
      });
    });

    it("should handle assay terms without definitions", async () => {
      const mockAssayTerms: AssayTermObject[] = [
        {
          "@id": "/assay-terms/OBI_0000185/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0000185",
          term_name: "imaging assay",
          definition: "An assay that produces a picture of an entity.",
        },
        {
          "@id": "/assay-terms/OBI_0003659/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0003659",
          term_name: "in vitro CRISPR screen assay",
        },
      ];

      const mockResponse = {
        "@graph": mockAssayTerms,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await getAssayTitleDescriptionMap(
        ["imaging assay", "in vitro CRISPR screen assay"],
        request
      );

      expect(result).toEqual({
        "imaging assay": "An assay that produces a picture of an entity.",
        "in vitro CRISPR screen assay": "",
      });
    });

    it("should handle empty titles array", async () => {
      const mockResponse = {
        "@graph": [],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await getAssayTitleDescriptionMap([], request);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("should handle request failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: jest.fn().mockResolvedValue({ error: "Not found" }),
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: "",
      } as unknown as Response);

      const result = await getAssayTitleDescriptionMap(["FAKE-seq"], request);

      expect(result).toEqual({});
    });

    it("should handle response without @graph property", async () => {
      const mockResponse = {};

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await getAssayTitleDescriptionMap(["FAKE-seq"], request);

      expect(result).toEqual({});
    });

    it("should properly encode special characters in titles", async () => {
      const mockResponse = {
        "@graph": [],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      await getAssayTitleDescriptionMap(
        ["RNA-seq & ChIP-seq", "test/title"],
        request
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/search-quick/?type=AssayTerm&field=term_name&field=definition&term_name=RNA-seq%20%26%20ChIP-seq&term_name=test%2Ftitle",
        expect.anything()
      );
    });
  });

  describe("getPreferredAssayTitleDescriptionMap", () => {
    it("should return enum_descriptions from MeasurementSet schema", () => {
      const mockProfiles = {
        "@type": ["Profiles"],
        _hierarchy: { Item: {} },
        _subtypes: {},
        MeasurementSet: {
          $id: "/profiles/measurement_set.json",
          $schema: "https://json-schema.org/draft/2020-12/schema",
          "@type": ["JSONSchema"],
          additionalProperties: false,
          mixinProperties: [],
          properties: {
            preferred_assay_titles: {
              title: "Preferred Assay Titles",
              type: "array",
              items: {
                title: "Preferred Assay Title",
                type: "string",
                enum_descriptions: {
                  "RNA-seq": "RNA sequencing description",
                  "ChIP-seq": "ChIP sequencing description",
                },
              },
            },
          },
          required: [],
          title: "Measurement Set",
          type: "object",
        },
      } as unknown as Profiles;

      const result = getPreferredAssayTitleDescriptionMap(mockProfiles);

      expect(result).toEqual({
        "RNA-seq": "RNA sequencing description",
        "ChIP-seq": "ChIP sequencing description",
      });
    });

    it("should return empty object when profiles is undefined", () => {
      const result = getPreferredAssayTitleDescriptionMap(undefined);

      expect(result).toEqual({});
    });

    it("should return empty object when MeasurementSet schema is missing", () => {
      const mockProfiles = {
        "@type": ["Profiles"],
        _hierarchy: { Item: {} },
        _subtypes: {},
      } as unknown as Profiles;

      const result = getPreferredAssayTitleDescriptionMap(mockProfiles);

      expect(result).toEqual({});
    });

    it("should return empty object when preferred_assay_titles property is missing", () => {
      const mockProfiles = {
        "@type": ["Profiles"],
        _hierarchy: { Item: {} },
        _subtypes: {},
        MeasurementSet: {
          $id: "/profiles/measurement_set.json",
          $schema: "https://json-schema.org/draft/2020-12/schema",
          "@type": ["JSONSchema"],
          additionalProperties: false,
          mixinProperties: [],
          properties: {},
          required: [],
          title: "Measurement Set",
          type: "object",
        },
      } as unknown as Profiles;

      const result = getPreferredAssayTitleDescriptionMap(mockProfiles);

      expect(result).toEqual({});
    });

    it("should return empty object when enum_descriptions is missing", () => {
      const mockProfiles = {
        "@type": ["Profiles"],
        _hierarchy: { Item: {} },
        _subtypes: {},
        MeasurementSet: {
          $id: "/profiles/measurement_set.json",
          $schema: "https://json-schema.org/draft/2020-12/schema",
          "@type": ["JSONSchema"],
          additionalProperties: false,
          mixinProperties: [],
          properties: {
            preferred_assay_titles: {
              title: "Preferred Assay Titles",
              type: "array",
              items: {
                title: "Preferred Assay Title",
                type: "string",
              },
            },
          },
          required: [],
          title: "Measurement Set",
          type: "object",
        },
      } as unknown as Profiles;

      const result = getPreferredAssayTitleDescriptionMap(mockProfiles);

      expect(result).toEqual({});
    });
  });

  describe("getAssayTitleDescription", () => {
    it("should return definition from successful response", async () => {
      const mockOntologyTerm: OntologyTermObject = {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
        definition: "An assay that produces a picture of an entity.",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockOntologyTerm));

      const result = await getAssayTitleDescription(
        "/assay-terms/OBI_0000185/",
        request
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/assay-terms/OBI_0000185/",
        expect.anything()
      );
      expect(result).toBe("An assay that produces a picture of an entity.");
    });

    it("should return empty string when definition is missing", async () => {
      const mockOntologyTerm: OntologyTermObject = {
        "@id": "/ontology-terms/EFO_0008896/",
        "@type": ["OntologyTerm"],
        term_id: "EFO:0008896",
        term_name: "RNA-seq",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockOntologyTerm));

      const result = await getAssayTitleDescription(
        "/ontology-terms/EFO_0008896/",
        request
      );

      expect(result).toBe("");
    });

    it("should return empty string when request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: jest.fn().mockResolvedValue({ error: "Not found" }),
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: "",
      } as unknown as Response);

      const result = await getAssayTitleDescription(
        "/ontology-terms/EFO_0008896/",
        request
      );

      expect(result).toBe("");
    });
  });

  describe("getMeasurementSetAssayTitleDescriptionMap", () => {
    it("should return description map when measurement set has assay_term object and assay_titles", async () => {
      const mockMeasurementSet: FileSetObject = {
        "@id": "/measurement-sets/IGVFDS0001MSMT/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          "@id": "/assay-terms/OBI_0000185/",
          "@type": ["AssayTerm", "OntologyTerm"],
          term_id: "OBI:0000185",
          term_name: "imaging assay",
        },
        assay_titles: ["imaging assay"],
        files: [],
        summary: "Test measurement set",
      };

      const mockOntologyTerm: OntologyTermObject = {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
        definition: "An assay that produces a picture of an entity.",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockOntologyTerm));

      const result = await getMeasurementSetAssayTitleDescriptionMap(
        mockMeasurementSet,
        request
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "/assay-terms/OBI_0000185/",
        expect.anything()
      );
      expect(result).toEqual({
        "imaging assay": "An assay that produces a picture of an entity.",
      });
    });

    it("should return empty object when assay_term is a string", async () => {
      const mockMeasurementSet: FileSetObject = {
        "@id": "/measurement-sets/IGVFDS0001MSMT/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: "/ontology-terms/EFO_0008896/", // string instead of object
        assay_titles: ["RNA-seq"],
        files: [],
        summary: "Test measurement set",
      };

      const result = await getMeasurementSetAssayTitleDescriptionMap(
        mockMeasurementSet,
        request
      );

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("should return empty object when assay_term is null", async () => {
      const mockMeasurementSet: FileSetObject = {
        "@id": "/measurement-sets/IGVFDS0001MSMT/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: null,
        assay_titles: ["RNA-seq"],
        files: [],
        summary: "Test measurement set",
      };

      const result = await getMeasurementSetAssayTitleDescriptionMap(
        mockMeasurementSet,
        request
      );

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("should return empty object when assay_titles is empty", async () => {
      const mockMeasurementSet: FileSetObject = {
        "@id": "/measurement-sets/IGVFDS0001MSMT/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          "@id": "/ontology-terms/EFO_0008896/",
          "@type": ["OntologyTerm"],
          term_id: "EFO:0008896",
          term_name: "RNA-seq",
        },
        assay_titles: [], // empty array
        files: [],
        summary: "Test measurement set",
      };

      const result = await getMeasurementSetAssayTitleDescriptionMap(
        mockMeasurementSet,
        request
      );

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("should return empty object when assay_term is undefined", async () => {
      const mockMeasurementSet: FileSetObject = {
        "@id": "/measurement-sets/IGVFDS0001MSMT/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        // assay_term is undefined
        assay_titles: ["RNA-seq"],
        files: [],
        summary: "Test measurement set",
      };

      const result = await getMeasurementSetAssayTitleDescriptionMap(
        mockMeasurementSet,
        request
      );

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it("should use only the first assay title when multiple titles exist", async () => {
      const mockMeasurementSet: FileSetObject = {
        "@id": "/measurement-sets/IGVFDS0001MSMT/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          "@id": "/ontology-terms/EFO_0008896/",
          "@type": ["OntologyTerm"],
          term_id: "EFO:0008896",
          term_name: "RNA-seq",
        },
        assay_titles: ["RNA-seq", "ChIP-seq"], // multiple titles
        files: [],
        summary: "Test measurement set",
      };

      const mockOntologyTerm: OntologyTermObject = {
        "@id": "/ontology-terms/EFO_0008896/",
        "@type": ["OntologyTerm"],
        term_id: "EFO:0008896",
        term_name: "RNA-seq",
        definition: "RNA sequencing assay description",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockOntologyTerm));

      const result = await getMeasurementSetAssayTitleDescriptionMap(
        mockMeasurementSet,
        request
      );

      expect(result).toEqual({
        "RNA-seq": "RNA sequencing assay description", // only first title used
      });
    });
  });
});
