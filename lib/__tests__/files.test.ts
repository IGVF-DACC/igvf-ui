import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
  splitIlluminaSequenceFiles,
} from "../files";
import type { DatabaseObject } from "../../globals.d";

describe("Test the splitIlluminaSequenceFiles function", () => {
  it("returns all arrays when given an array of each types of files", () => {
    const files: Array<DatabaseObject> = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRT/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRT",
        content_type: "reads",
        file_format: "fastq",
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

    expect(withIlluminaIds).equal(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).equal(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
    expect(withImageFiles).equal(["IGVFFI0000ILRI", "IGVFFI0001ILRI"]);
    expect(withTabularFiles).equal(["IGVFFI0001ILRO", "IGVFFI0001ILRJ"]);
  });

  it("returns an empty array for filesWithReadType, tabularFileType and imageFileType when given an array of sequence files without illumina_read_type", () => {
    const files: Array<DatabaseObject> = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRF/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRF",
        content_type: "reads",
        file_format: "fastq",
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

    expect(withIlluminaIds).equal([]);
    expect(withImageFiles).equal([]);
    expect(withTabularFiles).equal([]);
    expect(withoutIlluminaIds).equal(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
  });

  it("returns an empty array for filesWithoutReadType, tabularFileType and imageFileType when given an array of sequence files with illumina_read_type", () => {
    const files: Array<DatabaseObject> = [
      {
        "@context": "/terms/",
        "@id": "/sequence-files/IGVFFI0000ILRT/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI0000ILRT",
        content_type: "reads",
        file_format: "fastq",
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

    expect(withIlluminaIds).equal(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).equal([]);
    expect(withImageFiles).equal([]);
    expect(withTabularFiles).equal([]);
  });

  it("returns an empty array for filesWithoutReadType, tabularFileType and filesWithReadType when given an array of image files", () => {
    const files: Array<DatabaseObject> = [
      {
        "@context": "/terms/",
        "@id": "/image-files/IGVFFI0000ILRI/",
        "@type": ["ImageFile", "File", "Item"],
        accession: "IGVFFI0000ILRI",
        content_type: "low resolution tissue",
        file_format: "jpg",
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

    expect(withIlluminaIds).equal([]);
    expect(withoutIlluminaIds).equal([]);
    expect(withTabularFiles).equal([]);
    expect(withImageFiles).equal(["IGVFFI0000ILRI", "IGVFFI0001ILRI"]);
  });

  it("returns an empty array for filesWithoutReadType, imageFileType and filesWithReadType when given an array of tabular files", () => {
    const files: Array<DatabaseObject> = [
      {
        "@context": "/terms/",
        "@id": "/tabular-files/IGVFFI0001ILRJ/",
        "@type": ["TabularFile", "File", "Item"],
        accession: "IGVFFI0001ILRJ",
        content_type: "peaks",
        file_format: "bed",
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

    expect(withIlluminaIds).equal([]);
    expect(withoutIlluminaIds).equal([]);
    expect(withTabularFiles).equal(["IGVFFI0001ILRJ", "IGVFFI0001ILRO"]);
    expect(withImageFiles).equal([]);
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

    expect(withIlluminaIds).equal([]);
    expect(withoutIlluminaIds).equal([]);
    expect(withImageFiles).equal([]);
    expect(withTabularFiles).equal([]);
  });
});

describe("Test the checkForFileDownloadPath function", () => {
  it("returns true when given a file download path", () => {
    const path =
      "/sequence-files/IGVFFI0001FSTQ/@@download/IGVFFI0001FSTQ.fastq.gz";
    const result = checkForFileDownloadPath(path);
    expect(result).equal(true);
  });

  it("returns false when given a file object path", () => {
    const path = "/sequence-files/IGVFFI0001FSTQ/";
    const result = checkForFileDownloadPath(path);
    expect(result).equal(false);
  });

  it("returns false when given an empty string", () => {
    const path = "";
    const result = checkForFileDownloadPath(path);
    expect(result).equal(false);
  });
});

describe("Test the convertFileDownloadPathToFilePagePath function", () => {
  it("returns a file page path when given a file download path", () => {
    const path =
      "/sequence-files/IGVFFI0001FSTQ/@@download/IGVFFI0001FSTQ.fastq.gz";
    const result = convertFileDownloadPathToFilePagePath(path);
    expect(result).equal("/sequence-files/IGVFFI0001FSTQ/");
  });

  it("returns an empty string when given a file object path", () => {
    const path = "/sequence-files/IGVFFI0001FSTQ/";
    const result = convertFileDownloadPathToFilePagePath(path);
    expect(result).equal("");
  });
});
