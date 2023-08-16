import { SplitIlluminaSequenceFiles } from "../files";
import type { DatabaseObject } from "../../globals.d";

describe("Test the SplitIlluminaSequenceFiles function", () => {
  it("returns both arrays when given an array of both types of files", () => {
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
    ];

    const results = SplitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).toEqual(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
  });

  it("returns an empty array for filesWithReadType when given an array of files without illumina_read_type", () => {
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

    const results = SplitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual(["IGVFFI0000ILRF", "IGVFFI0001ILRF"]);
  });

  it("returns an empty array for filesWithoutReadType when given an array of files with illumina_read_type", () => {
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

    const results = SplitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual(["IGVFFI0000ILRT", "IGVFFI0001ILRT"]);
    expect(withoutIlluminaIds).toEqual([]);
  });

  it("returns an empty array for both filesWithReadType and filesWithoutReadType when given an empty array", () => {
    const files: Array<DatabaseObject> = [];

    const results = SplitIlluminaSequenceFiles(files);
    const withIlluminaIds = results.filesWithReadType.map(
      (file) => file.accession
    );
    const withoutIlluminaIds = results.filesWithoutReadType.map(
      (file) => file.accession
    );

    expect(withIlluminaIds).toEqual([]);
    expect(withoutIlluminaIds).toEqual([]);
  });
});
