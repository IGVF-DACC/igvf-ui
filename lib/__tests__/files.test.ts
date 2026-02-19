import {
  checkFileDownloadable,
  checkForFileDownloadPath,
  collectFileFileSetSamples,
  convertFileDownloadPathToFilePagePath,
  extractSeqspecsForFile,
  fileGroupsToDataGridFormat,
  generateSequenceFileGroups,
  getAllDerivedFromFiles,
  isFileObject,
  isFileObjectArray,
  paginateSequenceFileGroups,
  splitIlluminaSequenceFiles,
} from "../files";
import FetchRequest from "../fetch-request";
import type { Cell, RowComponentProps } from "../data-grid";
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
  SampleObject,
  SearchResults,
} from "../../globals";

describe("Test the splitIlluminaSequenceFiles function", () => {
  it("returns all arrays when given an array of each types of files", () => {
    const files: Array<FileObject> = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRT/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRT",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        illumina_read_type: "R1",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRF/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRF",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/image-files/IGVFFI0000ILRI/",
        "@type": ["ImageFile", "File", "Item"],
        accession: "IGVFFI0000ILRI",
        content_type: "low resolution tissue",
        file_format: "jpg",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0001ILRT/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0001ILRT",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        illumina_read_type: "R1",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/tabular-files/IGVFFI0001ILRJ/",
        "@type": ["TabularFile", "File", "Item"],
        accession: "IGVFFI0001ILRJ",
        content_type: "peaks",
        file_format: "bed",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0001ILRF/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0001ILRF",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/image-files/IGVFFI0001ILRI/",
        "@type": ["ImageFile", "File", "Item"],
        accession: "IGVFFI0001ILRI",
        content_type: "high resolution tissue",
        file_format: "png",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/tabular-files/IGVFFI0001ILRO/",
        "@type": ["TabularFile", "File", "Item"],
        accession: "IGVFFI0001ILRO",
        content_type: "sample sort parameters",
        file_format: "bed",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
    ];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);
    const withTabularFiles = results.tabularFileType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).toEqual(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
    expect(withImageFiles).toEqual(["IGVFFI0000ILRI", "IGVFFI0001ILRI"]);
    expect(withTabularFiles).toEqual(["IGVFFI0001ILRJ", "IGVFFI0001ILRO"]);
  });

  it("returns an empty array for filesWithReadType, tabularFileType and imageFileType when given an array of sequence files without illumina_read_type", () => {
    const files: Array<FileObject> = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRF/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRF",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0001ILRF/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0001ILRF",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
    ];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);
    const withTabularFiles = results.tabularFileType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual([]);
    expect(withTabularFiles).toEqual([]);
    expect(withoutIlluminaIds).toEqual(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
  });

  it("returns an empty array for filesWithoutReadType, tabularFileType and imageFileType when given an array of sequence files with illumina_read_type", () => {
    const files: Array<FileObject> = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRT/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRT",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        illumina_read_type: "R1",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0001ILRT/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0001ILRT",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        illumina_read_type: "R1",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
    ];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);
    const withTabularFiles = results.tabularFileType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual([]);
    expect(withTabularFiles).toEqual([]);
  });

  it("returns an empty array for filesWithoutReadType, tabularFileType and filesWithReadType when given an array of image files", () => {
    const files: Array<FileObject> = [
      {
        "@context": "/terms/",
        "@id": "/image-files/IGVFFI0000ILRI/",
        "@type": ["ImageFile", "File", "Item"],
        accession: "IGVFFI0000ILRI",
        content_type: "low resolution tissue",
        file_format: "jpg",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/image-files/IGVFFI0001ILRI/",
        "@type": ["ImageFile", "File", "Item"],
        accession: "IGVFFI0001ILRI",
        content_type: "high resolution tissue",
        file_format: "png",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
    ];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);
    const withTabularFiles = results.tabularFileType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withTabularFiles).toEqual([]);
    expect(withImageFiles).toEqual(["IGVFFI0000ILRI", "IGVFFI0001ILRI"]);
  });

  it("returns an empty array for filesWithoutReadType, imageFileType and filesWithReadType when given an array of tabular files", () => {
    const files: Array<FileObject> = [
      {
        "@context": "/terms/",
        "@id": "/tabular-files/IGVFFI0001ILRJ/",
        "@type": ["TabularFile", "File", "Item"],
        accession: "IGVFFI0001ILRJ",
        content_type: "peaks",
        file_format: "bed",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/tabular-files/IGVFFI0001ILRO/",
        "@type": ["TabularFile", "File", "Item"],
        accession: "IGVFFI0001ILRO",
        content_type: "sample sort parameters",
        file_format: "bed",
        file_set: "/file-sets/IGVFFI0000ILRT/",
        status: "in progress",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
    ];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);
    const withTabularFiles = results.tabularFileType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withTabularFiles).toEqual(["IGVFFI0001ILRJ", "IGVFFI0001ILRO"]);
    expect(withImageFiles).toEqual([]);
  });

  it("returns an empty array for both filesWithReadType, imageFileType, tabularFileType and filesWithoutReadType when given an empty array", () => {
    const files: Array<DatabaseObject> = [];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);
    const withTabularFiles = results.tabularFileType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual([]);
    expect(withTabularFiles).toEqual([]);
  });
});

describe("Test the checkForFileDownloadPath function", () => {
  it("returns true when given a file download path", () => {
    const path =
      "/sequence-files/IGVFFI0001FSTQ/@@download/IGVFFI0001FSTQ.fastq.gz";
    const result = checkForFileDownloadPath(path);
    expect(result).toEqual(true);
  });

  it("returns false when given a file object path", () => {
    const path = "/sequence-files/IGVFFI0001FSTQ/";
    const result = checkForFileDownloadPath(path);
    expect(result).toEqual(false);
  });

  it("returns false when given an empty string", () => {
    const path = "";
    const result = checkForFileDownloadPath(path);
    expect(result).toEqual(false);
  });
});

describe("Test the convertFileDownloadPathToFilePagePath function", () => {
  it("returns a file page path when given a file download path", () => {
    const path =
      "/sequence-files/IGVFFI0001FSTQ/@@download/IGVFFI0001FSTQ.fastq.gz";
    const result = convertFileDownloadPathToFilePagePath(path);
    expect(result).toEqual("/sequence-files/IGVFFI0001FSTQ/");
  });

  it("returns an empty string when given a file object path", () => {
    const path = "/sequence-files/IGVFFI0001FSTQ/";
    const result = convertFileDownloadPathToFilePagePath(path);
    expect(result).toEqual("");
  });
});

describe("Test the generateGraphData function", () => {
  it("returns a list of files that derive from each other", async () => {
    const files: FileObject[] = [
      {
        "@id": "file1",
        "@type": ["File"],
        accession: "file1",
        content_type: "peaks",
        derived_from: ["file2"],
        file_set: "file-set-1",
        file_format: "fastq",
      },
      {
        "@id": "file2",
        "@type": ["File"],
        accession: "file2",
        content_type: "peaks",
        file_set: "file-set-1",
        file_format: "bam",
      },
    ];
    const request = new FetchRequest();
    const derivedFromList = await getAllDerivedFromFiles(files, request);
    expect(derivedFromList).toEqual([]);
  });

  it("returns a list of files where one derived_from belongs to another file set", async () => {
    const mockResult: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "file3",
          "@type": ["File"],
          accession: "file3",
          file_set: "file-set-2",
          file_format: "bam",
        },
      ],
      "@id": "/search/?type=File",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      facets: [
        {
          field: "file_format",
          title: "File Format",
          terms: [
            { key: "fastq", doc_count: 10 },
            { key: "bam", doc_count: 5 },
          ],
          type: "terms",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      filters: [
        {
          field: "file_format",
          term: "fastq",
          remove: "/search/?type=File",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const files: FileObject[] = [
      {
        "@id": "file1",
        "@type": ["File"],
        accession: "file1",
        content_type: "peaks",
        derived_from: ["file2"],
        file_set: "file-set-1",
        file_format: "fastq",
      },
      {
        "@id": "file2",
        "@type": ["File"],
        accession: "file2",
        content_type: "peaks",
        derived_from: ["file3"],
        file_set: "file-set-1",
        file_format: "bam",
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const derivedFromList = await getAllDerivedFromFiles(files, request);
    expect(derivedFromList).toEqual([
      {
        "@id": "file3",
        "@type": ["File"],
        accession: "file3",
        file_set: "file-set-2",
        file_format: "bam",
      },
    ]);
  });

  it("crashes if a loop exists in the data", async () => {
    const mockResult: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "file3",
          "@type": ["File"],
          accession: "file3",
          derived_from: ["file2"],
          file_set: "file-set-2",
          file_format: "bam",
        },
      ],
      "@id": "/search/?type=File",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      facets: [
        {
          field: "file_format",
          title: "File Format",
          terms: [
            { key: "fastq", doc_count: 10 },
            { key: "bam", doc_count: 5 },
          ],
          type: "terms",
        },
      ],
      columns: {
        "@id": {
          title: "ID",
        },
      },
      filters: [
        {
          field: "file_format",
          term: "fastq",
          remove: "/search/?type=File",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const files: FileObject[] = [
      {
        "@id": "file1",
        "@type": ["File"],
        accession: "file1",
        content_type: "peaks",
        derived_from: ["file2"],
        file_set: "file-set-1",
        file_format: "fastq",
      },
      {
        "@id": "file2",
        "@type": ["File"],
        accession: "file2",
        content_type: "peaks",
        derived_from: ["file3"],
        file_set: "file-set-1",
        file_format: "bam",
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    await expect(getAllDerivedFromFiles(files, request)).rejects.toThrow(
      "Detected a derived_from loop with file ID: file3"
    );
  });
});

describe("Test the checkFileDownloadable function", () => {
  it("returns true when a file is downloadable", () => {
    const file: FileObject = {
      "@id": "file-1",
      "@type": ["File", "Item"],
      content_type: "peaks",
      file_format: "fastq",
      file_set: "file-set-1",
      status: "released",
      upload_status: "validated",
    };
    const result = checkFileDownloadable(file);
    expect(result).toEqual(true);
  });

  it("returns false when a file is not downloadable because of its upload status", () => {
    const file: FileObject = {
      "@id": "file-1",
      "@type": ["File", "Item"],
      content_type: "peaks",
      file_format: "fastq",
      file_set: "file-set-1",
      status: "in progress",
      upload_status: "pending",
    };
    const result = checkFileDownloadable(file);
    expect(result).toEqual(false);
  });

  it("returns false when a file is not downloadable because of its anvil status", () => {
    const file: FileObject = {
      "@id": "file-1",
      "@type": ["File", "Item"],
      content_type: "peaks",
      file_format: "fastq",
      file_set: "file-set-1",
      status: "released",
      controlled_access: true,
      anvil_url: "https://anvil.org",
    };
    const result = checkFileDownloadable(file);
    expect(result).toEqual(false);
  });

  it("returns false when a file is externally hosted", () => {
    const file: FileObject = {
      "@id": "file-1",
      "@type": ["File", "Item"],
      content_type: "peaks",
      file_format: "fastq",
      file_set: "file-set-1",
      status: "released",
      externally_hosted: true,
    };
    const result = checkFileDownloadable(file);
    expect(result).toEqual(false);
  });
});

describe("Test collectFileFileSetSamples function", () => {
  it("returns a list of samples in a file's file set", () => {
    const sample1: SampleObject = {
      "@id": "sample-1",
      "@type": ["Sample", "Item"],
    };
    const sample2: SampleObject = {
      "@id": "sample-2",
      "@type": ["Sample", "Item"],
    };
    const fileSet: FileSetObject = {
      "@id": "file-set-1",
      "@type": ["FileSet", "Item"],
      files: ["file-1", "file-2"],
      samples: [sample1, sample2],
      summary: "Summary of file set 1",
    };
    const file: FileObject = {
      "@id": "file-1",
      "@type": ["File", "Item"],
      content_type: "peaks",
      file_format: "fastq",
      file_set: fileSet,
    };

    const samples = collectFileFileSetSamples(file);
    expect(samples.length).toEqual(2);
    expect(samples[0]["@id"]).toEqual(sample1["@id"]);
    expect(samples[1]["@id"]).toEqual(sample2["@id"]);
  });
});

describe("Test the generateSequenceFileGroups function", () => {
  /* eslint-disable camelcase */
  function createSequenceFile(
    id: string,
    sequencing_run?: number,
    flowcell_id?: string,
    lane?: number,
    illumina_read_type?: string
  ): FileObject {
    return {
      "@context": "/terms/",
      "@id": `/sequence-files/${id}/`,
      "@type": ["SequenceFile", "File", "Item"],
      accession: id,
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000ILRT/",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      ...(sequencing_run !== undefined && { sequencing_run }),
      ...(flowcell_id && { flowcell_id }),
      ...(lane !== undefined && { lane }),
      ...(illumina_read_type && { illumina_read_type }),
    };
  }
  /* eslint-enable camelcase */

  it("groups files by sequencing run, flowcell ID, and lane", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
      createSequenceFile("FILE3", 1, "DEF456", 2, "R1"),
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(2);
    expect(result.has("S1-ABC123-L1")).toBe(true);
    expect(result.has("S1-DEF456-L2")).toBe(true);
    expect(result.get("S1-ABC123-L1")).toHaveLength(2);
    expect(result.get("S1-DEF456-L2")).toHaveLength(1);
  });

  it("excludes files without sequencing_run", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", undefined, "ABC123", 1, "R2"), // No sequencing_run
      createSequenceFile("FILE3", 2, "DEF456", 2, "R1"),
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(2);
    expect(result.has("S1-ABC123-L1")).toBe(true);
    expect(result.has("S2-DEF456-L2")).toBe(true);
    expect(result.get("S1-ABC123-L1")).toHaveLength(1);
    expect(result.get("S1-ABC123-L1")?.[0].accession).toBe("FILE1");
  });

  it("includes sequencing_run: 0 as a valid value", () => {
    const files = [
      createSequenceFile("FILE1", 0, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, "DEF456", 2, "R2"),
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(2);
    expect(result.has("S0-ABC123-L1")).toBe(true);
    expect(result.has("S1-DEF456-L2")).toBe(true);
    expect(result.get("S0-ABC123-L1")).toHaveLength(1);
    expect(result.get("S0-ABC123-L1")?.[0].accession).toBe("FILE1");
  });

  it("handles missing flowcell_id with placeholder", () => {
    const files = [
      createSequenceFile("FILE1", 1, undefined, 1, "R1"), // No flowcell_id
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(2);
    expect(result.has("S1-ABC123-L1")).toBe(true);
    expect(result.has("S1-z-L1")).toBe(true);
    expect(result.get("S1-z-L1")).toHaveLength(1);
    expect(result.get("S1-z-L1")?.[0].accession).toBe("FILE1");
  });

  it("handles missing lane with placeholder", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", undefined, "R1"), // No lane
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(2);
    expect(result.has("S1-ABC123-L1")).toBe(true);
    expect(result.has("S1-ABC123-Lz")).toBe(true);
    expect(result.get("S1-ABC123-Lz")).toHaveLength(1);
    expect(result.get("S1-ABC123-Lz")?.[0].accession).toBe("FILE1");
  });

  it("handles missing both flowcell_id and lane with placeholders", () => {
    const files = [
      createSequenceFile("FILE1", 1, undefined, undefined, "R1"), // No flowcell_id or lane
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(2);
    expect(result.has("S1-ABC123-L1")).toBe(true);
    expect(result.has("S1-z-Lz")).toBe(true);
    expect(result.get("S1-z-Lz")).toHaveLength(1);
    expect(result.get("S1-z-Lz")?.[0].accession).toBe("FILE1");
  });

  it("sorts files within groups by illumina_read_type", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R2"),
      createSequenceFile("FILE2", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE3", 1, "ABC123", 1, "I2"),
      createSequenceFile("FILE4", 1, "ABC123", 1, "I1"),
    ];

    const result = generateSequenceFileGroups(files);
    const group = result.get("S1-ABC123-L1");

    expect(group).toHaveLength(4);
    expect(group?.[0].illumina_read_type).toBe("I1");
    expect(group?.[1].illumina_read_type).toBe("I2");
    expect(group?.[2].illumina_read_type).toBe("R1");
    expect(group?.[3].illumina_read_type).toBe("R2");
  });

  it("handles files without illumina_read_type", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, "ABC123", 1, undefined), // No illumina_read_type
      createSequenceFile("FILE3", 1, "ABC123", 1, "R2"),
    ];

    const result = generateSequenceFileGroups(files);
    const group = result.get("S1-ABC123-L1");

    expect(group).toHaveLength(3);
    // Files are sorted by illumina_read_type: R1, R2, then undefined (comes last)
    expect(group?.[0].illumina_read_type).toBe("R1");
    expect(group?.[1].illumina_read_type).toBe("R2");
    expect(group?.[2].accession).toBe("FILE2");
    expect(group?.[2].illumina_read_type).toBeUndefined();
  });

  it("returns groups with keys sorted alphabetically", () => {
    const files = [
      createSequenceFile("FILE1", 3, "ZZZ999", 3, "R1"),
      createSequenceFile("FILE2", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE3", 2, "DEF456", 2, "R1"),
    ];

    const result = generateSequenceFileGroups(files);
    const keys = Array.from(result.keys());

    expect(keys).toEqual(["S1-ABC123-L1", "S2-DEF456-L2", "S3-ZZZ999-L3"]);
  });

  it("handles empty array", () => {
    const result = generateSequenceFileGroups([]);
    expect(result.size).toBe(0);
  });

  it("handles complex grouping scenario", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
      createSequenceFile("FILE3", 1, "ABC123", 2, "R1"),
      createSequenceFile("FILE4", 2, "ABC123", 1, "R1"),
      createSequenceFile("FILE5", 1, "DEF456", 1, "R1"),
      createSequenceFile("FILE6", undefined, "ABC123", 1, "R1"), // Excluded
    ];

    const result = generateSequenceFileGroups(files);

    expect(result.size).toBe(4);
    expect(result.has("S1-ABC123-L1")).toBe(true);
    expect(result.has("S1-ABC123-L2")).toBe(true);
    expect(result.has("S1-DEF456-L1")).toBe(true);
    expect(result.has("S2-ABC123-L1")).toBe(true);

    expect(result.get("S1-ABC123-L1")).toHaveLength(2);
    expect(result.get("S1-ABC123-L2")).toHaveLength(1);
    expect(result.get("S1-DEF456-L1")).toHaveLength(1);
    expect(result.get("S2-ABC123-L1")).toHaveLength(1);
  });

  it("ensures placeholder files sort to end alphabetically", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, undefined, 1, "R1"), // flowcell_id placeholder
      createSequenceFile("FILE3", 1, "ABC123", undefined, "R1"), // lane placeholder
    ];

    const result = generateSequenceFileGroups(files);
    const keys = Array.from(result.keys());

    expect(keys).toEqual(["S1-ABC123-L1", "S1-ABC123-Lz", "S1-z-L1"]);
  });
});

describe("Test the fileGroupsToDataGridFormat function", () => {
  /* eslint-disable camelcase */
  function createSequenceFile(
    id: string,
    sequencing_run?: number,
    flowcell_id?: string,
    lane?: number,
    illumina_read_type?: string
  ): FileObject {
    return {
      "@context": "/terms/",
      "@id": `/sequence-files/${id}/`,
      "@type": ["SequenceFile", "File", "Item"],
      accession: id,
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000ILRT/",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      ...(sequencing_run !== undefined && { sequencing_run }),
      ...(flowcell_id && { flowcell_id }),
      ...(lane !== undefined && { lane }),
      ...(illumina_read_type && { illumina_read_type }),
    };
  }

  function createColumnConfig(): Cell[] {
    return [
      {
        id: "accession",
        content: ({ source }: any) => (source as FileObject).accession,
      },
      {
        id: "file_format",
        content: ({ source }: any) => (source as FileObject).file_format,
      },
      {
        id: "illumina_read_type",
        content: ({ source }: any) => (source as FileObject).illumina_read_type,
      },
    ];
  }

  function createMockRowComponent(): React.ComponentType<
    RowComponentProps<unknown>
  > {
    // Create a mock component that can be identified in tests
    function MockRowComponent() {
      return null;
    }
    MockRowComponent.displayName = "MockRowComponent";
    return MockRowComponent;
  }
  /* eslint-enable camelcase */

  it("converts file groups to data grid format with basic groups", () => {
    const files1 = [createSequenceFile("FILE1", 1, "ABC123", 1, "R1")];
    const files2 = [createSequenceFile("FILE2", 1, "ABC123", 2, "R2")];

    const fileGroups = new Map([
      ["S1-ABC123-L1", files1],
      ["S1-ABC123-L2", files2],
    ]);

    const columnConfig = createColumnConfig();
    const result = fileGroupsToDataGridFormat(fileGroups, columnConfig);

    expect(result).toHaveLength(2);

    // Check first row
    expect(result[0].id).toBe("/sequence-files/FILE1/");
    expect(result[0].cells).toHaveLength(3);
    expect(result[0].cells[0].source).toEqual(files1[0]);
    expect(result[0].cells[0].id).toBe("accession");
    expect(result[0].RowComponent).toBeUndefined();

    // Check second row (should have alternate row component)
    expect(result[1].id).toBe("/sequence-files/FILE2/");
    expect(result[1].cells).toHaveLength(3);
    expect(result[1].cells[0].source).toEqual(files2[0]);
    expect(result[1].RowComponent).toBeUndefined();
  });

  it("applies alternate row component to odd-indexed groups", () => {
    const files1 = [createSequenceFile("FILE1", 1, "ABC123", 1, "R1")];
    const files2 = [createSequenceFile("FILE2", 1, "ABC123", 2, "R2")];

    const fileGroups = new Map([
      ["S1-ABC123-L1", files1],
      ["S1-ABC123-L2", files2],
    ]);

    const columnConfig = createColumnConfig();
    const alternateRowComponent = createMockRowComponent();
    const result = fileGroupsToDataGridFormat(
      fileGroups,
      columnConfig,
      alternateRowComponent
    );

    expect(result).toHaveLength(2);

    // First group (index 0) - no alternate component
    expect(result[0].RowComponent).toBeUndefined();

    // Second group (index 1) - should have alternate component
    expect(result[1].RowComponent).toBe(alternateRowComponent);
  });

  it("handles multiple files within a group", () => {
    const files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
      createSequenceFile("FILE3", 1, "ABC123", 1, "I1"),
    ];

    const fileGroups = new Map([["S1-ABC123-L1", files]]);
    const columnConfig = createColumnConfig();
    const result = fileGroupsToDataGridFormat(fileGroups, columnConfig);

    expect(result).toHaveLength(3);

    // All files should have the same group index (0), so no alternate components
    expect(result[0].id).toBe("/sequence-files/FILE1/");
    expect(result[0].RowComponent).toBeUndefined();
    expect(result[1].id).toBe("/sequence-files/FILE2/");
    expect(result[1].RowComponent).toBeUndefined();
    expect(result[2].id).toBe("/sequence-files/FILE3/");
    expect(result[2].RowComponent).toBeUndefined();
  });

  it("handles multiple groups with multiple files each", () => {
    const group1Files = [
      createSequenceFile("FILE1", 1, "ABC123", 1, "R1"),
      createSequenceFile("FILE2", 1, "ABC123", 1, "R2"),
    ];
    const group2Files = [
      createSequenceFile("FILE3", 1, "ABC123", 2, "R1"),
      createSequenceFile("FILE4", 1, "ABC123", 2, "R2"),
    ];

    const fileGroups = new Map([
      ["S1-ABC123-L1", group1Files], // Index 0
      ["S1-ABC123-L2", group2Files], // Index 1
    ]);

    const columnConfig = createColumnConfig();
    const alternateRowComponent = createMockRowComponent();
    const result = fileGroupsToDataGridFormat(
      fileGroups,
      columnConfig,
      alternateRowComponent
    );

    expect(result).toHaveLength(4);

    // Group 1 files (index 0) - no alternate component
    expect(result[0].id).toBe("/sequence-files/FILE1/");
    expect(result[0].RowComponent).toBeUndefined();
    expect(result[1].id).toBe("/sequence-files/FILE2/");
    expect(result[1].RowComponent).toBeUndefined();

    // Group 2 files (index 1) - should have alternate component
    expect(result[2].id).toBe("/sequence-files/FILE3/");
    expect(result[2].RowComponent).toBe(alternateRowComponent);
    expect(result[3].id).toBe("/sequence-files/FILE4/");
    expect(result[3].RowComponent).toBe(alternateRowComponent);
  });

  it("handles empty file groups map", () => {
    const fileGroups = new Map();
    const columnConfig = createColumnConfig();
    const result = fileGroupsToDataGridFormat(fileGroups, columnConfig);

    expect(result).toEqual([]);
  });

  it("handles empty column configuration", () => {
    const files = [createSequenceFile("FILE1", 1, "ABC123", 1, "R1")];
    const fileGroups = new Map([["S1-ABC123-L1", files]]);
    const columnConfig: Cell[] = [];
    const result = fileGroupsToDataGridFormat(fileGroups, columnConfig);

    expect(result).toHaveLength(1);
    expect(result[0].cells).toHaveLength(0);
    expect(result[0].id).toBe("/sequence-files/FILE1/");
  });

  it("preserves map iteration order", () => {
    const files1 = [createSequenceFile("FILE1", 1, "ABC123", 1, "R1")];
    const files2 = [createSequenceFile("FILE2", 2, "DEF456", 2, "R2")];
    const files3 = [createSequenceFile("FILE3", 3, "GHI789", 3, "R1")];

    // Create map in specific order
    const fileGroups = new Map([
      ["S3-GHI789-L3", files3],
      ["S1-ABC123-L1", files1],
      ["S2-DEF456-L2", files2],
    ]);

    const columnConfig = createColumnConfig();
    const alternateRowComponent = createMockRowComponent();
    const result = fileGroupsToDataGridFormat(
      fileGroups,
      columnConfig,
      alternateRowComponent
    );

    expect(result).toHaveLength(3);

    // Should maintain the order of the Map keys
    expect(result[0].id).toBe("/sequence-files/FILE3/"); // Index 0 - no alternate
    expect(result[0].RowComponent).toBeUndefined();
    expect(result[1].id).toBe("/sequence-files/FILE1/"); // Index 1 - should have alternate
    expect(result[1].RowComponent).toBe(alternateRowComponent);
    expect(result[2].id).toBe("/sequence-files/FILE2/"); // Index 2 - no alternate
    expect(result[2].RowComponent).toBeUndefined();
  });

  it("handles large number of groups for alternating pattern", () => {
    const fileGroups = new Map();
    const files = [];

    // Create 6 groups to test alternating pattern
    for (let i = 0; i < 6; i++) {
      const file = createSequenceFile(`FILE${i}`, 1, `FC${i}`, i, "R1");
      files.push(file);
      fileGroups.set(`S1-FC${i}-L${i}`, [file]);
    }

    const columnConfig = createColumnConfig();
    const alternateRowComponent = createMockRowComponent();
    const result = fileGroupsToDataGridFormat(
      fileGroups,
      columnConfig,
      alternateRowComponent
    );

    expect(result).toHaveLength(6);

    // Check alternating pattern: even indices (0,2,4) = no component, odd indices (1,3,5) = component
    expect(result[0].RowComponent).toBeUndefined(); // Index 0
    expect(result[1].RowComponent).toBe(alternateRowComponent); // Index 1
    expect(result[2].RowComponent).toBeUndefined(); // Index 2
    expect(result[3].RowComponent).toBe(alternateRowComponent); // Index 3
    expect(result[4].RowComponent).toBeUndefined(); // Index 4
    expect(result[5].RowComponent).toBe(alternateRowComponent); // Index 5
  });
});

describe("Test the applyFileToCells function", () => {
  function createTestFile(): FileObject {
    return {
      "@context": "/terms/",
      "@id": "/sequence-files/TEST123/",
      "@type": ["SequenceFile", "File", "Item"],
      accession: "TEST123",
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000ILRT/",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      sequencing_run: 1,
      flowcell_id: "ABC123",
      lane: 1,
      illumina_read_type: "R1",
    };
  }

  function createCellConfig(): Cell[] {
    return [
      {
        id: "accession",
        content: ({ source }: any) => (source as FileObject).accession,
      },
      {
        id: "file_format",
        content: ({ source }: any) => (source as FileObject).file_format,
      },
      {
        id: "custom",
        content: "static content",
        columns: 2,
        role: "cell",
      },
    ];
  }

  it("applies file object to all cells as source property", () => {
    const file = createTestFile();
    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const columnConfig = createCellConfig();

    const result = fileGroupsToDataGridFormat(fileGroups, columnConfig);

    expect(result).toHaveLength(1);
    const row = result[0];

    expect(row.cells).toHaveLength(3);

    // Each cell should have the file as its source
    row.cells.forEach((cell) => {
      expect(cell.source).toBe(file);
    });
  });

  it("preserves original cell properties while adding source", () => {
    const file = createTestFile();
    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const originalCells = createCellConfig();

    const result = fileGroupsToDataGridFormat(fileGroups, originalCells);
    const resultCells = result[0].cells;

    expect(resultCells).toHaveLength(3);

    // Check that original properties are preserved
    expect(resultCells[0].id).toBe("accession");
    expect(resultCells[0].content).toBe(originalCells[0].content);
    expect(resultCells[0].source).toBe(file);

    expect(resultCells[1].id).toBe("file_format");
    expect(resultCells[1].content).toBe(originalCells[1].content);
    expect(resultCells[1].source).toBe(file);

    expect(resultCells[2].id).toBe("custom");
    expect(resultCells[2].content).toBe("static content");
    expect(resultCells[2].columns).toBe(2);
    expect(resultCells[2].role).toBe("cell");
    expect(resultCells[2].source).toBe(file);
  });

  it("creates new cell objects without mutating originals", () => {
    const file = createTestFile();
    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const originalCells = createCellConfig();

    const result = fileGroupsToDataGridFormat(fileGroups, originalCells);
    const resultCells = result[0].cells;

    // Original cells should not have been mutated
    originalCells.forEach((originalCell) => {
      expect(originalCell.source).toBeUndefined();
    });

    // Result cells should be different objects
    resultCells.forEach((resultCell, index) => {
      expect(resultCell).not.toBe(originalCells[index]);
      expect(resultCell.source).toBe(file);
    });
  });

  it("handles empty cells array", () => {
    const file = createTestFile();
    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const emptyCells: Cell[] = [];

    const result = fileGroupsToDataGridFormat(fileGroups, emptyCells);

    expect(result).toHaveLength(1);
    expect(result[0].cells).toEqual([]);
    expect(result[0].id).toBe(file["@id"]);
  });

  it("handles cells with all properties", () => {
    const file = createTestFile();
    const complexCells: Cell[] = [
      {
        id: "complex",
        content: ({ source }: any) =>
          `Complex: ${(source as FileObject).accession}`,
        columns: 3,
        role: "gridcell",
        noWrapper: true,
      },
    ];

    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const result = fileGroupsToDataGridFormat(fileGroups, complexCells);

    expect(result).toHaveLength(1);
    const resultCell = result[0].cells[0];

    // All original properties should be preserved
    expect(resultCell.id).toBe("complex");
    expect(resultCell.content).toBe(complexCells[0].content);
    expect(resultCell.columns).toBe(3);
    expect(resultCell.role).toBe("gridcell");
    expect(resultCell.noWrapper).toBe(true);
    expect(resultCell.source).toBe(file);
  });

  it("applies different files to cells correctly", () => {
    const file1 = createTestFile();
    const file2 = {
      ...createTestFile(),
      "@id": "/sequence-files/TEST456/",
      accession: "TEST456",
    };

    const fileGroups = new Map([
      ["S1-ABC123-L1", [file1]],
      ["S1-ABC123-L2", [file2]],
    ]);
    const columnConfig = createCellConfig();

    const result = fileGroupsToDataGridFormat(fileGroups, columnConfig);

    expect(result).toHaveLength(2);

    // First file's cells should have file1 as source
    result[0].cells.forEach((cell) => {
      expect(cell.source).toBe(file1);
    });

    // Second file's cells should have file2 as source
    result[1].cells.forEach((cell) => {
      expect(cell.source).toBe(file2);
    });
  });

  it("handles cells with function content that uses source", () => {
    const file = createTestFile();
    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const dynamicCells: Cell[] = [
      {
        id: "dynamic",
        content: ({ source }: any) =>
          `Accession: ${(source as FileObject).accession}`,
      },
    ];

    const result = fileGroupsToDataGridFormat(fileGroups, dynamicCells);

    expect(result).toHaveLength(1);
    const resultCell = result[0].cells[0];

    // The function content should be preserved and source should be set
    expect(resultCell.id).toBe("dynamic");
    expect(typeof resultCell.content).toBe("function");
    expect(resultCell.source).toBe(file);

    // Test that the function can be called with the source
    const contentFunction = resultCell.content as (props: any) => string;
    expect(contentFunction({ source: file })).toBe("Accession: TEST123");
  });

  it("preserves undefined optional properties", () => {
    const file = createTestFile();
    const fileGroups = new Map([["S1-ABC123-L1", [file]]]);
    const minimalCells: Cell[] = [
      {
        id: "minimal",
        content: "simple content",
        // columns, role, noWrapper are undefined
      },
    ];

    const result = fileGroupsToDataGridFormat(fileGroups, minimalCells);

    expect(result).toHaveLength(1);
    const resultCell = result[0].cells[0];

    expect(resultCell.id).toBe("minimal");
    expect(resultCell.content).toBe("simple content");
    expect(resultCell.columns).toBeUndefined();
    expect(resultCell.role).toBeUndefined();
    expect(resultCell.noWrapper).toBeUndefined();
    expect(resultCell.source).toBe(file);
  });
});

describe("Test the paginateSequenceFileGroups function", () => {
  // Helper function to create test files with different properties for grouping
  function createTestFileForGroup(
    id: string,
    accession: string,
    sequencingRun?: number,
    flowcellId?: string,
    lane?: number,
    readType?: string
  ): FileObject {
    return {
      "@context": "/terms/",
      "@id": id,
      "@type": ["SequenceFile", "File", "Item"],
      accession,
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000TEST/",
      sequencing_run: sequencingRun,
      flowcell_id: flowcellId,
      lane,
      illumina_read_type: readType,
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
    } as FileObject;
  }

  it("handles empty file groups map", () => {
    const emptyFileGroups = new Map<string, FileObject[]>();
    const result = paginateSequenceFileGroups(emptyFileGroups, 10);

    expect(result).toEqual([]);
  });

  it("returns single page when total files are less than page size", () => {
    const file1 = createTestFileForGroup(
      "/files/1/",
      "TEST001",
      1,
      "ABC123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/2/",
      "TEST002",
      1,
      "ABC123",
      1,
      "R2"
    );
    const file3 = createTestFileForGroup(
      "/files/3/",
      "TEST003",
      2,
      "XYZ456",
      1,
      "R1"
    );

    const fileGroups = new Map([
      ["S1-ABC123-L1", [file1, file2]],
      ["S2-XYZ456-L1", [file3]],
    ]);

    const result = paginateSequenceFileGroups(fileGroups, 10);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(fileGroups);
    expect(result[0].get("S1-ABC123-L1")).toEqual([file1, file2]);
    expect(result[0].get("S2-XYZ456-L1")).toEqual([file3]);
  });

  it("returns single page when total files equals page size", () => {
    const file1 = createTestFileForGroup(
      "/files/1/",
      "TEST001",
      1,
      "ABC123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/2/",
      "TEST002",
      1,
      "ABC123",
      1,
      "R2"
    );

    const fileGroups = new Map([["S1-ABC123-L1", [file1, file2]]]);

    const result = paginateSequenceFileGroups(fileGroups, 2);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(fileGroups);
  });

  it("splits into multiple pages when files exceed page size", () => {
    const file1 = createTestFileForGroup(
      "/files/1/",
      "TEST001",
      1,
      "ABC123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/2/",
      "TEST002",
      1,
      "ABC123",
      1,
      "R2"
    );
    const file3 = createTestFileForGroup(
      "/files/3/",
      "TEST003",
      2,
      "XYZ456",
      1,
      "R1"
    );
    const file4 = createTestFileForGroup(
      "/files/4/",
      "TEST004",
      2,
      "XYZ456",
      1,
      "R2"
    );
    const file5 = createTestFileForGroup(
      "/files/5/",
      "TEST005",
      3,
      "DEF789",
      1,
      "R1"
    );

    const fileGroups = new Map([
      ["S1-ABC123-L1", [file1, file2]],
      ["S2-XYZ456-L1", [file3, file4]],
      ["S3-DEF789-L1", [file5]],
    ]);

    const result = paginateSequenceFileGroups(fileGroups, 3);

    expect(result).toHaveLength(2);

    // First page should have the first two groups (4 files total, exceeds page size after adding second group)
    expect(result[0].size).toBe(2);
    expect(result[0].has("S1-ABC123-L1")).toBe(true);
    expect(result[0].has("S2-XYZ456-L1")).toBe(true);
    expect(result[0].get("S1-ABC123-L1")).toEqual([file1, file2]);
    expect(result[0].get("S2-XYZ456-L1")).toEqual([file3, file4]);

    // Second page should have the third group
    expect(result[1].size).toBe(1);
    expect(result[1].has("S3-DEF789-L1")).toBe(true);
    expect(result[1].get("S3-DEF789-L1")).toEqual([file5]);
  });

  it("keeps complete groups together even when exceeding page size", () => {
    const file1 = createTestFileForGroup(
      "/files/1/",
      "TEST001",
      1,
      "ABC123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/2/",
      "TEST002",
      1,
      "ABC123",
      1,
      "R2"
    );
    const file3 = createTestFileForGroup(
      "/files/3/",
      "TEST003",
      1,
      "ABC123",
      1,
      "I1"
    );
    const file4 = createTestFileForGroup(
      "/files/4/",
      "TEST004",
      2,
      "XYZ456",
      1,
      "R1"
    );

    const fileGroups = new Map([
      ["S1-ABC123-L1", [file1, file2, file3]], // 3 files in one group
      ["S2-XYZ456-L1", [file4]], // 1 file in another group
    ]);

    // Page size is 2, but the first group has 3 files, so it gets its own page
    const result = paginateSequenceFileGroups(fileGroups, 2);

    expect(result).toHaveLength(2);

    // First page should have the entire first group (3 files) even though it exceeds page size
    expect(result[0].size).toBe(1);
    expect(result[0].has("S1-ABC123-L1")).toBe(true);
    expect(result[0].get("S1-ABC123-L1")).toEqual([file1, file2, file3]);

    // Second page should have the second group
    expect(result[1].size).toBe(1);
    expect(result[1].has("S2-XYZ456-L1")).toBe(true);
    expect(result[1].get("S2-XYZ456-L1")).toEqual([file4]);
  });

  it("handles multiple groups fitting exactly on one page", () => {
    const file1 = createTestFileForGroup(
      "/files/100/",
      "TEST100",
      100,
      "UNIQUE123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/200/",
      "TEST200",
      200,
      "UNIQUE456",
      1,
      "R1"
    );
    const file3 = createTestFileForGroup(
      "/files/300/",
      "TEST300",
      300,
      "UNIQUE789",
      1,
      "R1"
    );

    const fileGroups = new Map([
      ["S100-UNIQUE123-L1", [file1]], // 1 file
      ["S200-UNIQUE456-L1", [file2]], // 1 file
      ["S300-UNIQUE789-L1", [file3]], // 1 file
    ]);

    const result = paginateSequenceFileGroups(fileGroups, 3);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(fileGroups);
    expect(result[0].size).toBe(3);
  });

  it("handles single group with single file", () => {
    const file1 = createTestFileForGroup(
      "/files/1/",
      "TEST001",
      1,
      "ABC123",
      1,
      "R1"
    );

    const fileGroups = new Map([["S1-ABC123-L1", [file1]]]);

    const result = paginateSequenceFileGroups(fileGroups, 5);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(fileGroups);
  });

  it("handles page size of 1 with multiple single-file groups", () => {
    const file1 = createTestFileForGroup(
      "/files/10/",
      "SINGLE001",
      10,
      "SINGLE123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/20/",
      "SINGLE002",
      20,
      "SINGLE456",
      1,
      "R1"
    );
    const file3 = createTestFileForGroup(
      "/files/30/",
      "SINGLE003",
      30,
      "SINGLE789",
      1,
      "R1"
    );

    const fileGroups = new Map([
      ["S10-SINGLE123-L1", [file1]],
      ["S20-SINGLE456-L1", [file2]],
      ["S30-SINGLE789-L1", [file3]],
    ]);

    const result = paginateSequenceFileGroups(fileGroups, 1);

    expect(result).toHaveLength(3);
    expect(result[0].get("S10-SINGLE123-L1")).toEqual([file1]);
    expect(result[1].get("S20-SINGLE456-L1")).toEqual([file2]);
    expect(result[2].get("S30-SINGLE789-L1")).toEqual([file3]);
  });

  it("preserves order of groups across pages", () => {
    const files = Array.from({ length: 8 }, (_, i) =>
      createTestFileForGroup(
        `/files/${i + 40}/`,
        `ORDER00${i + 1}`,
        i + 40,
        `ORDER${i + 1}`,
        1,
        "R1"
      )
    );

    const fileGroups = new Map(
      files.map((file, i) => [`S${i + 40}-ORDER${i + 1}-L1`, [file]])
    );

    const result = paginateSequenceFileGroups(fileGroups, 3);

    expect(result).toHaveLength(3);

    // Check that groups maintain their original order across pages
    expect(result[0].has("S40-ORDER1-L1")).toBe(true);
    expect(result[0].has("S41-ORDER2-L1")).toBe(true);
    expect(result[0].has("S42-ORDER3-L1")).toBe(true);

    expect(result[1].has("S43-ORDER4-L1")).toBe(true);
    expect(result[1].has("S44-ORDER5-L1")).toBe(true);
    expect(result[1].has("S45-ORDER6-L1")).toBe(true);

    expect(result[2].has("S46-ORDER7-L1")).toBe(true);
    expect(result[2].has("S47-ORDER8-L1")).toBe(true);
  });

  it("handles large page size with small number of groups", () => {
    const file1 = createTestFileForGroup(
      "/files/large1/",
      "LARGE001",
      500,
      "LARGE123",
      1,
      "R1"
    );
    const file2 = createTestFileForGroup(
      "/files/large2/",
      "LARGE002",
      500,
      "LARGE123",
      1,
      "R2"
    );

    const fileGroups = new Map([["S500-LARGE123-L1", [file1, file2]]]);

    const result = paginateSequenceFileGroups(fileGroups, 1000);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(fileGroups);
  });
});

describe("Test the extractSeqspecsForFile function", () => {
  // Helper function to create test seqspec file objects
  function createTestSeqspecFile(id: string, accession: string): FileObject {
    return {
      "@context": "/terms/",
      "@id": id,
      "@type": ["SequenceFile", "File", "Item"],
      accession,
      content_type: "sequence specification",
      file_format: "json",
      file_set: "/file-sets/IGVFFI0000SEQSPEC/",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
    } as FileObject;
  }

  // Helper function to create test file with seqspecs property
  function createTestFileWithSeqspecs(
    id: string,
    accession: string,
    seqspecs: string[] | Array<{ "@id": string }>
  ): FileObject {
    return {
      "@context": "/terms/",
      "@id": id,
      "@type": ["SequenceFile", "File", "Item"],
      accession,
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000TEST/",
      seqspecs,
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
    } as FileObject;
  }

  it("returns empty array when file has no seqspecs property", () => {
    const file = createTestFileWithSeqspecs(
      "/files/no-seqspecs/",
      "IGVFFI0000NOSQ",
      []
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toEqual([]);
  });

  it("returns empty array when file has undefined seqspecs property", () => {
    const file = {
      "@context": "/terms/",
      "@id": "/files/undefined-seqspecs/",
      "@type": ["SequenceFile", "File", "Item"],
      accession: "IGVFFI0000UNDEF",
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000TEST/",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
    } as FileObject;
    const seqspecs = [createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS")];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toEqual([]);
  });

  it("extracts matching seqspecs when file has string array seqspecs", () => {
    const file = createTestFileWithSeqspecs(
      "/files/string-seqspecs/",
      "IGVFFI0000STRNG",
      ["/seqspecs/1/", "/seqspecs/3/"]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
      createTestSeqspecFile("/seqspecs/3/", "IGVFFI0003SEQS"),
      createTestSeqspecFile("/seqspecs/4/", "IGVFFI0004SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(seqspecs[0]);
    expect(result[1]).toEqual(seqspecs[2]);
  });

  it("extracts matching seqspecs when file has object array seqspecs", () => {
    const file = createTestFileWithSeqspecs(
      "/files/object-seqspecs/",
      "IGVFFI0000SOBJ",
      [{ "@id": "/seqspecs/2/" }, { "@id": "/seqspecs/4/" }]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
      createTestSeqspecFile("/seqspecs/3/", "IGVFFI0003SEQS"),
      createTestSeqspecFile("/seqspecs/4/", "IGVFFI0004SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(seqspecs[1]);
    expect(result[1]).toEqual(seqspecs[3]);
  });

  it("returns empty array when no seqspecs match file's seqspec paths", () => {
    const file = createTestFileWithSeqspecs(
      "/files/no-matches/",
      "IGVFFI0000SEQA",
      ["/seqspecs/nonexistent1/", "/seqspecs/nonexistent2/"]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toEqual([]);
  });

  it("returns partial matches when some seqspecs exist and others don't", () => {
    const file = createTestFileWithSeqspecs(
      "/files/partial-matches/",
      "IGVFFI0000PART",
      ["/seqspecs/1/", "/seqspecs/nonexistent/", "/seqspecs/3/"]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
      createTestSeqspecFile("/seqspecs/3/", "IGVFFI0003SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(seqspecs[0]);
    expect(result[1]).toEqual(seqspecs[2]);
  });

  it("sorts results by accession in ascending order", () => {
    const file = createTestFileWithSeqspecs(
      "/files/sorting-test/",
      "IGVFFI0000SORT",
      ["/seqspecs/zebra/", "/seqspecs/alpha/", "/seqspecs/charlie/"]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/zebra/", "IGVFFI0003SEQS"),
      createTestSeqspecFile("/seqspecs/alpha/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/charlie/", "IGVFFI0002SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(3);
    expect(result[0].accession).toBe("IGVFFI0001SEQS");
    expect(result[1].accession).toBe("IGVFFI0002SEQS");
    expect(result[2].accession).toBe("IGVFFI0003SEQS");
  });

  it("handles empty seqspecs array", () => {
    const file = createTestFileWithSeqspecs(
      "/files/empty-seqspecs-array/",
      "IGVFFI0000EMPT",
      ["/seqspecs/1/", "/seqspecs/2/"]
    );
    const seqspecs: FileObject[] = [];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toEqual([]);
  });

  it("handles single seqspec match", () => {
    const file = createTestFileWithSeqspecs(
      "/files/single-match/",
      "IGVFFI0000SING",
      ["/seqspecs/only/"]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/only/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/other/", "IGVFFI0002SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(seqspecs[0]);
  });

  it("preserves all properties of matched seqspec files", () => {
    const detailedSeqspec = {
      "@context": "/terms/",
      "@id": "/seqspecs/detailed/",
      "@type": ["SequenceFile", "File", "Item"],
      accession: "IGVFFI0000SEQS",
      content_type: "sequence specification",
      file_format: "json",
      file_set: "/file-sets/IGVFDS0000TEST/",
      status: "released",
      uuid: "12345678-1234-1234-1234-123456789012",
      creation_timestamp: "2023-12-01T10:00:00.000000+00:00",
      file_size: 12345,
      md5sum: "abcdef123456",
      submitted_by: "/users/test-user/",
      lab: "/labs/test-lab/",
    } as FileObject;

    const file = createTestFileWithSeqspecs(
      "/files/detailed-match/",
      "IGVFFI0000DETA",
      ["/seqspecs/detailed/"]
    );
    const seqspecs = [detailedSeqspec];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(detailedSeqspec);
    expect(result[0].file_size).toBe(12345);
    expect(result[0].md5sum).toBe("abcdef123456");
    expect(result[0].submitted_by).toBe("/users/test-user/");
  });

  it("handles mixed string and object seqspecs properly by detecting type from first element", () => {
    // Test with string array (should process as strings)
    const fileWithStrings = createTestFileWithSeqspecs(
      "/files/mixed-strings/",
      "IGVFFI0000MXDS",
      ["/seqspecs/1/", "/seqspecs/2/"]
    );

    // Test with object array (should process as objects)
    const fileWithObjects = createTestFileWithSeqspecs(
      "/files/mixed-objects/",
      "IGVFFI0000MXDO",
      [{ "@id": "/seqspecs/1/" }, { "@id": "/seqspecs/2/" }]
    );

    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
    ];

    const resultStrings = extractSeqspecsForFile(fileWithStrings, seqspecs);
    const resultObjects = extractSeqspecsForFile(fileWithObjects, seqspecs);

    // Both should return the same result
    expect(resultStrings).toHaveLength(2);
    expect(resultObjects).toHaveLength(2);
    expect(resultStrings).toEqual(resultObjects);
  });

  it("handles duplicate seqspec paths by returning unique matches", () => {
    const file = createTestFileWithSeqspecs(
      "/files/duplicates/",
      "IGVFFI0000DUPL",
      ["/seqspecs/1/", "/seqspecs/1/", "/seqspecs/2/", "/seqspecs/2/"]
    );
    const seqspecs = [
      createTestSeqspecFile("/seqspecs/1/", "IGVFFI0001SEQS"),
      createTestSeqspecFile("/seqspecs/2/", "IGVFFI0002SEQS"),
    ];

    const result = extractSeqspecsForFile(file, seqspecs);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(seqspecs[0]);
    expect(result[1]).toEqual(seqspecs[1]);
  });
});

describe("Test the isFileObject function", () => {
  it("returns true for a valid FileObject", () => {
    const file: FileObject = {
      "@context": "/terms/",
      "@id": "/sequence-files/IGVFFI0000TEST/",
      "@type": ["SequenceFile", "File", "Item"],
      accession: "IGVFFI0000TEST",
      content_type: "reads",
      file_format: "fastq",
      file_set: "/file-sets/IGVFFI0000TEST/",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
      creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
    };

    expect(isFileObject(file)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isFileObject(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isFileObject(undefined)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isFileObject("not a file")).toBe(false);
  });

  it("returns false for a number", () => {
    expect(isFileObject(42)).toBe(false);
  });

  it("returns false for an object without @type", () => {
    const notAFile = {
      "@id": "/something/",
      accession: "TEST123",
    };

    expect(isFileObject(notAFile)).toBe(false);
  });

  it("returns false for an object with @type that is not an array", () => {
    const notAFile = {
      "@type": "NotAnArray",
      accession: "TEST123",
    };

    expect(isFileObject(notAFile)).toBe(false);
  });

  it("returns false for an object with @type array that does not include 'File'", () => {
    const notAFile = {
      "@type": ["SomethingElse", "Item"],
      accession: "TEST123",
    };

    expect(isFileObject(notAFile)).toBe(false);
  });
});

describe("Test the isFileObjectArray function", () => {
  it("returns true for an array of FileObjects", () => {
    const files: FileObject[] = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000TEST/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000TEST",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000TEST/",
        status: "released",
        uuid: "00000000-0000-0000-0000-000000000000",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0001TEST/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0001TEST",
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/IGVFFI0000TEST/",
        status: "released",
        uuid: "00000000-0000-0000-0000-000000000001",
        creation_timestamp: "2023-11-30T22:47:32.147601+00:00",
      },
    ];

    expect(isFileObjectArray(files)).toBe(true);
  });

  it("returns false for an empty array", () => {
    expect(isFileObjectArray([])).toBe(false);
  });

  it("returns false for an array of strings", () => {
    expect(isFileObjectArray(["/files/path1/", "/files/path2/"])).toBe(false);
  });

  it("returns false for a non-array", () => {
    expect(isFileObjectArray("not an array")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isFileObjectArray(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isFileObjectArray(undefined)).toBe(false);
  });

  it("returns false for an array of objects without @type", () => {
    const notFiles = [{ accession: "TEST123" }, { accession: "TEST456" }];

    expect(isFileObjectArray(notFiles)).toBe(false);
  });
});
