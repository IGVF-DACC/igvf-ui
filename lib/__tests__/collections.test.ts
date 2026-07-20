import fs from "node:fs";
import path from "node:path";
import type { FileObject } from "../../globals";
import {
  getCollectionLogoFileNames,
  getCollectionPath,
  isFileInCatalog,
} from "../collections";

describe("isFileInCatalog", () => {
  const baseTestFile: FileObject = {
    "@id": "/alignment-files/IGVFFI0000AAAA/",
    "@type": ["File", "Item"],
    accession: "IGVFFI0000AAAA",
    content_type: "alignments",
    file_format: "bam",
    file_set: "/measurement-sets/IGVFDS0000AAAA/",
    md5sum: "9f4c2d8b7e6a1f30c5d94b18a2ef7c61",
    status: "in progress",
  };

  it("should return true if the file is in the catalog", () => {
    const testFile0 = {
      ...baseTestFile,
      collections: ["IGVF_catalog_beta_v0.5"],
    };
    expect(isFileInCatalog(testFile0)).toBe(true);

    const testFile1 = {
      ...baseTestFile,
      collections: ["ENCODE", "IGVF_catalog_v1.0"],
    };
    expect(isFileInCatalog(testFile1)).toBe(true);
  });

  it("should return false if the file is not in the catalog", () => {
    const testFile = { ...baseTestFile, collections: ["ENCODE", "Morphic"] };
    expect(isFileInCatalog(testFile)).toBe(false);
  });

  it("should return false if the file has no collections", () => {
    const testFile0 = { ...baseTestFile, collections: [] };
    expect(isFileInCatalog(testFile0)).toBe(false);

    const testFile1 = { ...baseTestFile };
    expect(isFileInCatalog(testFile1)).toBe(false);
  });
});

describe("getCollectionPath", () => {
  it("should return the correct path for a known collection", () => {
    expect(getCollectionPath("ENCODE")).toBe("/collections/encode.svg");
    expect(getCollectionPath("IGVF_catalog_beta_v0.5")).toBe(
      "/collections/igvf-catalog-0.5.svg"
    );
  });

  it("should return an empty string for an unknown collection", () => {
    expect(getCollectionPath("UnknownCollection")).toBe("");
    expect(getCollectionPath(undefined as unknown as string)).toBe("");
    expect(getCollectionPath("toString")).toBe("");
  });
});

describe("collectionMap files in repo", () => {
  it("the collection image files must exist in the repo", () => {
    const baseDir = path.join(process.cwd(), "public", "collections");
    const collectionFileNames = getCollectionLogoFileNames();

    expect(collectionFileNames.length).toBeGreaterThan(0);
    for (const fileName of collectionFileNames) {
      const fullPath = path.join(baseDir, fileName);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });
});
