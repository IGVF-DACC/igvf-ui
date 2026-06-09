import FetchRequest from "../fetch-request";
import {
  isFileSetObjectType,
  requestAssociatedFileSets,
  requestFileSetDonors,
  requestFileSetPublications,
  requestFileSetSamples,
  type CuratedSetObject,
  type PseudobulkSetObject,
} from "../file-sets";
import { type SampleObject } from "../samples";
import type { HumanDonorObject, PublicationObject } from "../../globals";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Helper to create consistent mock responses.
function createMockResponse(data: any): Response {
  return {
    ok: true,
    json: () => Promise.resolve(data),
    status: 200,
    statusText: "OK",
  } as Response;
}

describe("requestAssociatedFileSets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetch.mockReset();
  });

  it("returns an an array of two file sets given an array of two file sets", async () => {
    const fileSet1: PseudobulkSetObject = {
      "@id": "/file-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };
    const fileSet2: PseudobulkSetObject = {
      "@id": "/file-sets/IGVFDS0002PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0002PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0001EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const resultFileSet1: PseudobulkSetObject = {
      "@id": "/curated-sets/IGVFDS0000PSBK/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000EXSD",
      award: "/awards/HG012012/",
      description:
        "A curated set to store sequencing data from an external source.",
      file_set_type: "external sequencing data",
      files: ["/files/IGVFFL0000FFFF/"],
      lab: "/labs/j-michael-cherry/",
      preferred_assay_titles: ["STARR-seq"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };
    const resultFileSet2: CuratedSetObject = {
      "@id": "/curated-sets/IGVFDS0001PSBK/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0001EXSD",
      award: "/awards/HG012012/",
      description:
        "A curated set to store sequencing data from an external source.",
      file_set_type: "external sequencing data",
      files: ["/files/IGVFFL0000FFFF/"],
      lab: "/labs/j-michael-cherry/",
      preferred_assay_titles: ["STARR-seq"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const mockResult = {
      "@graph": [resultFileSet1, resultFileSet2],
    };

    // Mock the response for the getObject call within getMultipleObjectsBulk
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResult));

    const request = new FetchRequest();
    const result = await requestAssociatedFileSets(
      [fileSet1, fileSet2],
      "input_file_sets",
      request
    );

    expect(result).toEqual([resultFileSet1, resultFileSet2]);
  });

  it("returns an an array of one file set given two file sets with the same input file set", async () => {
    const fileSet1: PseudobulkSetObject = {
      "@id": "/file-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };
    const fileSet2: PseudobulkSetObject = {
      "@id": "/file-sets/IGVFDS0002PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0002PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const resultFileSet1: CuratedSetObject = {
      "@id": "/curated-sets/IGVFDS0000PSBK/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000EXSD",
      assay_term: "/assay-terms/OBI_0002041/",
      award: "/awards/HG012012/",
      description:
        "A curated set to store sequencing data from an external source.",
      file_set_type: "external sequencing data",
      files: ["/files/IGVFFL0000FFFF/"],
      lab: "/labs/j-michael-cherry/",
      preferred_assay_titles: ["STARR-seq"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const mockResult = {
      "@graph": [resultFileSet1],
    };

    // Mock the response for the getObject call within getMultipleObjectsBulk
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResult));

    const request = new FetchRequest();
    const result = await requestAssociatedFileSets(
      [fileSet1, fileSet2],
      "input_file_sets",
      request
    );

    expect(result).toEqual([resultFileSet1]);
  });

  it("returns an empty array given file sets with no associated file sets", async () => {
    const fileSet1: PseudobulkSetObject = {
      "@id": "/file-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const request = new FetchRequest();
    const result = await requestAssociatedFileSets(
      [fileSet1],
      "input_file_sets",
      request
    );

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns an empty array given objects that aren't database objects", async () => {
    const fileSet1 = {
      "@id": "/file-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };
    const fileSet2 = {
      property: "value",
    };

    const request = new FetchRequest();
    const result = await requestAssociatedFileSets(
      [fileSet1, fileSet2 as unknown as PseudobulkSetObject],
      "input_file_sets",
      request
    );

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("requestFileSetDonors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetch.mockReset();
  });

  it("returns an array of donor objects given a file set with donor paths", async () => {
    const fileSet: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      donors: ["/donors/IGVFDN0000DDDD/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const resultDonor: HumanDonorObject = {
      "@id": "/donors/IGVFDN0000DDDD/",
      "@type": ["Donor", "Item"],
      accession: "IGVFDN0000DDDD",
      description: "A donor with a disease.",
      documents: ["/documents/IGVFDO0000DDDD/"],
      lab: "/labs/j-michael-cherry/",
      sex: "female",
      status: "in progress",
      taxa: "Homo sapiens",
    };

    const mockResult = {
      "@graph": [resultDonor],
    };

    mockFetch.mockResolvedValueOnce(createMockResponse(mockResult));

    const request = new FetchRequest();
    const result = await requestFileSetDonors(fileSet, request);

    expect(result).toEqual([resultDonor]);
  });

  it("returns an empty array given a file set with no donors", async () => {
    const fileSet: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const request = new FetchRequest();
    const result = await requestFileSetDonors(fileSet, request);

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("requestFileSetPublications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetch.mockReset();
  });

  it("returns an array of publication objects given a file set with publication paths", async () => {
    const fileSet: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      publications: ["/publications/IGVFPB0000PPPP/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const resultPublication: PublicationObject = {
      "@id": "/publications/IGVFPB0000PPPP/",
      "@type": ["Publication", "Item"],
      accession: "IGVFPB0000PPPP",
      description: "A publication about the file set.",
      lab: "/labs/j-michael-cherry/",
      publication_identifiers: ["doi:10.1234/igvf.56789"],
      title: "A scientific paper about the file set.",
      status: "in progress",
    };

    const mockResult = {
      "@graph": [resultPublication],
    };

    mockFetch.mockResolvedValueOnce(createMockResponse(mockResult));

    const request = new FetchRequest();
    const result = await requestFileSetPublications(fileSet, request);

    expect(result).toEqual([resultPublication]);
  });

  it("returns an empty array given a file set with no publications", async () => {
    const fileSet: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const request = new FetchRequest();
    const result = await requestFileSetPublications(fileSet, request);

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("requestFileSetSamples", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockFetch.mockReset();
  });

  it("returns an array of sample objects given file sets with sample paths", async () => {
    const fileSet1: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };
    const fileSet2: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0002PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0002PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0001EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const resultSample: SampleObject = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      description: "A sample of primary cells.",
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
      summary: "A sample of primary cells.",
    };

    const mockResult = {
      "@graph": [resultSample],
    };

    mockFetch.mockResolvedValueOnce(createMockResponse(mockResult));

    const request = new FetchRequest();
    const result = await requestFileSetSamples([fileSet1, fileSet2], request);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual([resultSample]);
  });

  it("returns an empty array given file sets with no samples", async () => {
    const fileSet1: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };
    const fileSet2: PseudobulkSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0002PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0002PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0001EXSD/"],
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    const request = new FetchRequest();
    const result = await requestFileSetSamples([fileSet1, fileSet2], request);

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns an empty array given a array of objects that aren't database objects", async () => {
    const object1 = {
      property: "value",
    };
    const object2 = {
      property: "value",
    };

    const request = new FetchRequest();
    // @ts-expect-error Testing behavior with non-database objects
    const result = await requestFileSetSamples([object1, object2], request);

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("isFileSetObjectType", () => {
  it("returns true for objects with FileSet in their @type", () => {
    const fileSetObject = {
      "@id": "/pseudobulk-sets/IGVFDS0001PSBK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      accession: "IGVFDS0001PSBK",
      award: "/awards/HG012012/",
      cell_type: "/sample-terms/CL_0000787/",
      file_set_type: "pseudobulk analysis",
      files: ["/files/IGVFFL0000FFFF/"],
      input_file_sets: ["/curated-sets/IGVFDS0000EXSD/"],
      lab: "/labs/j-michael-cherry/",
      samples: ["/primary-cells/IGVFSM0000EEEE/"],
      status: "in progress",
      summary: "A file set for pseudobulk analysis.",
    };

    expect(isFileSetObjectType(fileSetObject, "PseudobulkSet")).toBe(true);
  });

  it("returns false for objects without FileSet in their @type", () => {
    const nonFileSetObject = {
      "@id": "/samples/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      description: "A sample of primary cells.",
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
    };

    expect(isFileSetObjectType(nonFileSetObject as any, "PseudobulkSet")).toBe(
      false
    );
  });

  it("returns false for null or undefined objects", () => {
    expect(isFileSetObjectType(null as any, "PseudobulkSet")).toBe(false);
    expect(isFileSetObjectType(undefined as any, "PseudobulkSet")).toBe(false);
  });
});
