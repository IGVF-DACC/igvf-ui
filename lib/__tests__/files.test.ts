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

    expect(withIlluminaIds).toEqual(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).toEqual(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
    expect(withImageFiles).toEqual(["IGVFFI0000ILRI", "IGVFFI0001ILRI"]);
  });

  it("returns an empty array for filesWithReadType and imageFileType when given an array of sequence files without illumina_read_type", () => {
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

    expect(withIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual([]);
    expect(withoutIlluminaIds).toEqual(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
  });

  it("returns an empty array for filesWithoutReadType and imageFileType when given an array of sequence files with illumina_read_type", () => {
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

    expect(withIlluminaIds).toEqual(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual([]);
  });

  it("returns an empty array for filesWithoutReadType and filesWithReadType when given an array of image files", () => {
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

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual(["IGVFFI0000ILRI", "IGVFFI0001ILRI"]);
  });

  it("returns an empty array for both filesWithReadType, withImageFiles and filesWithoutReadType when given an empty array", () => {
    const files: Array<DatabaseObject> = [];

    const results = splitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );
    const withImageFiles = results.imageFileType.map((file) => file.accession);

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual([]);
    expect(withImageFiles).toEqual([]);
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
