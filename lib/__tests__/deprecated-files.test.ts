import {
  computeDefaultDeprecatedVisibility,
  computeFileDisplayData,
  deprecatedStatusQueryParam,
  isDeprecatedStatus,
  resolveDeprecatedFileProps,
  trimDeprecatedFiles,
  type DeprecatedFileFilterProps,
} from "../deprecated-files";
import type { FileObject } from "../../globals";

describe("Test isDeprecatedStatus type guard", () => {
  it("should return true for deprecated statuses", () => {
    expect(isDeprecatedStatus("archived")).toBe(true);
    expect(isDeprecatedStatus("revoked")).toBe(true);
    expect(isDeprecatedStatus("deleted")).toBe(true);
  });

  it("should return false for non-deprecated statuses", () => {
    expect(isDeprecatedStatus("released")).toBe(false);
    expect(isDeprecatedStatus("in progress")).toBe(false);
    expect(isDeprecatedStatus("")).toBe(false);
  });
});

describe("Test trimDeprecatedFiles function", () => {
  it("should return an empty array when given an empty array", () => {
    let result = trimDeprecatedFiles([], true);
    expect(result).toEqual([]);

    result = trimDeprecatedFiles([], false);
    expect(result).toEqual([]);
  });

  it("should filter out archived files when isArchivedVisible is false", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "archived",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "released",
      },
    ];

    const result = trimDeprecatedFiles(files, false);
    expect(result).toHaveLength(1);
    expect(result[0]["@id"]).toBe("/files/file2");
  });

  it("should return all files when isArchivedVisible is true", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "archived",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "released",
      },
    ];

    const result = trimDeprecatedFiles(files, true);
    expect(result).toHaveLength(2);
    expect(result.map((f) => f["@id"])).toEqual([
      "/files/file1",
      "/files/file2",
    ]);
  });

  it("should handle files without a status field", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        // No status field
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "released",
      },
    ];

    const result = trimDeprecatedFiles(files, false);
    expect(result).toHaveLength(1);
    expect(result[0]["@id"]).toBe("/files/file2");
  });
});

describe("Test resolveDeprecatedFileProps function", () => {
  it("should return external props when provided", () => {
    const localProps = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Local Title",
    };

    const externalProps = {
      visible: true,
      setVisible: () => {},
      defaultVisible: true,
      controlTitle: "External Title",
    };

    const result = resolveDeprecatedFileProps(localProps, externalProps);
    expect(result).toEqual(externalProps);
  });

  it("should return local props when external props are not provided", () => {
    const localProps = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Local Title",
    };

    const result = resolveDeprecatedFileProps(localProps);
    expect(result).toEqual(localProps);
  });

  it("should use local props as fallback when external props are partially provided", () => {
    const localProps1 = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Local Title",
    };

    const externalProps1 = {
      visible: true,
      // setVisible is not provided, should fall back to local
      defaultVisible: true,
      // controlTitle is not provided, should fall back to local
    };

    const result1 = resolveDeprecatedFileProps(localProps1, externalProps1);
    expect(result1).toEqual({
      visible: true,
      setVisible: localProps1.setVisible,
      defaultVisible: true,
      controlTitle: "Local Title",
    });

    const localProps2 = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Local Title",
    };

    const externalProps2 = {
      // visible is not provided, should fall back to local
      setVisible: () => {},
      // defaultVisible is not provided, should fall back to local
      controlTitle: "External Title",
    };

    const result2 = resolveDeprecatedFileProps(localProps2, externalProps2);
    expect(result2).toEqual({
      visible: localProps2.visible,
      setVisible: externalProps2.setVisible,
      defaultVisible: localProps2.defaultVisible,
      controlTitle: "External Title",
    });
  });

  it("should use default control title if neither local nor external provide one", () => {
    const localProps = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      // controlTitle is not provided
    };

    const externalProps = {
      visible: true,
      setVisible: () => {},
      defaultVisible: true,
      // controlTitle is not provided
    };

    const result = resolveDeprecatedFileProps(localProps, externalProps);
    expect(result.controlTitle).toBe("Include deprecated files");
  });
});

describe("Test computeFileDisplayData function", () => {
  it("should return false if no files are deprecated", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "released",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "in progress",
      },
    ];

    const deprecated: DeprecatedFileFilterProps = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Include deprecated files",
    };

    const result = computeFileDisplayData(files, deprecated);
    expect(result.visibleFiles).toEqual(files);
    expect(result.showDeprecatedToggle).toBe(false);
  });

  it("should return true if there are deprecated files and no external default visibility is set", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "archived",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "released",
      },
    ];

    const deprecated: DeprecatedFileFilterProps = {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Include deprecated files",
    };

    const result = computeFileDisplayData(files, deprecated);
    expect(result.visibleFiles).toEqual([files[1]]);
    expect(result.showDeprecatedToggle).toBe(true);
  });

  it("should respect external default visibility when provided", () => {
    const files: FileObject[] = [
      {
        "@id": "/files/file1",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "archived",
      },
      {
        "@id": "/files/file2",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        status: "released",
      },
    ];

    const deprecated: DeprecatedFileFilterProps = {
      visible: true,
      setVisible: () => {},
      defaultVisible: true,
      controlTitle: "Include deprecated files",
    };

    const result = computeFileDisplayData(files, deprecated);
    expect(result.visibleFiles).toEqual(files);
    expect(result.showDeprecatedToggle).toBe(true);
  });
});

describe("Test deprecatedStatusQueryParam function", () => {
  it("should return correct query param for != operator", () => {
    const result = deprecatedStatusQueryParam("!=");
    expect(result).toBe("status!=archived&status!=revoked&status!=deleted");
  });

  it("should return correct query param for = operator", () => {
    const result = deprecatedStatusQueryParam("=");
    expect(result).toBe("status=archived&status=revoked&status=deleted");
  });

  it("should default to != operator when no operator is provided", () => {
    const result = deprecatedStatusQueryParam();
    expect(result).toBe("status!=archived&status!=revoked&status!=deleted");
  });
});

describe("Test computeDefaultDeprecatedVisibility function", () => {
  it("should return false if there are no deprecated files and no external default visibility is set", () => {
    const result = computeDefaultDeprecatedVisibility(false);
    expect(result).toBe(true);
  });

  it("should return true if there are deprecated files and no external default visibility is set", () => {
    const result = computeDefaultDeprecatedVisibility(true);
    expect(result).toBe(false);
  });

  it("should return external default visibility when provided", () => {
    const result = computeDefaultDeprecatedVisibility(true, {
      visible: false,
      setVisible: () => {},
      defaultVisible: false,
      controlTitle: "Include deprecated files",
    });
    expect(result).toBe(false);
  });
});
