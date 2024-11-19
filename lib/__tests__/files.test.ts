import {
  checkFileDownloadable,
  checkForFileDownloadPath,
  collectFileFileSetSamples,
  convertFileDownloadPathToFilePagePath,
  getAllDerivedFromFiles,
  splitIlluminaSequenceFiles,
} from "../files";
import FetchRequest from "../fetch-request";
import type {
  DatabaseObject,
  FileObject,
  FileSetObject,
  SampleObject,
  SearchResults,
} from "../../globals.d";

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
      columns: {
        "@id": {
          title: "ID",
        },
      },
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
      columns: {
        "@id": {
          title: "ID",
        },
      },
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
