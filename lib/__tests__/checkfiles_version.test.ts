import { checkCheckfilesVersionVisible } from "../checkfiles-version";
import { FileObject } from "../../globals";

describe("Test checkCheckfilesVersionVisible", () => {
  it("should return true if checkfiles_version is present", () => {
    const file: FileObject = {
      "@id": "/files/123",
      "@type": ["File", "Item"],
      checkfiles_version: "1.0.0",
      content_type: "text",
      file_format: "txt",
      file_set: "/measurement-sets/123",
      reference_files: [],
      upload_status: "validated",
    };
    expect(checkCheckfilesVersionVisible(file)).toBe(true);
  });

  it("should return true if upload_status is 'validation exempted'", () => {
    const file: FileObject = {
      "@id": "/files/123",
      "@type": ["File", "Item"],
      content_type: "text",
      file_format: "txt",
      file_set: "/measurement-sets/123",
      reference_files: [],
      upload_status: "validation exempted",
    };
    expect(checkCheckfilesVersionVisible(file)).toBe(true);
  });

  it("should return true if upload_status is 'validated'", () => {
    const file: FileObject = {
      "@id": "/files/123",
      "@type": ["File", "Item"],
      content_type: "text",
      file_format: "txt",
      file_set: "/measurement-sets/123",
      reference_files: [],
      upload_status: "validated",
    };
    expect(checkCheckfilesVersionVisible(file)).toBe(true);
  });

  it("should return true if upload_status is 'invalidated'", () => {
    const file: FileObject = {
      "@id": "/files/123",
      "@type": ["File", "Item"],
      content_type: "text",
      file_format: "txt",
      file_set: "/measurement-sets/123",
      reference_files: [],
      upload_status: "invalidated",
    };
    expect(checkCheckfilesVersionVisible(file)).toBe(true);
  });

  it("should return false if checkfiles_version is not present and upload_status is not 'validation exempted', 'validated', or 'invalidated'", () => {
    const file: FileObject = {
      "@id": "/files/123",
      "@type": ["File", "Item"],
      content_type: "text",
      file_format: "txt",
      file_set: "/measurement-sets/123",
      reference_files: [],
      upload_status: "pending",
    };
    expect(checkCheckfilesVersionVisible(file)).toBe(false);

    file.upload_status = "file not found";
    expect(checkCheckfilesVersionVisible(file)).toBe(false);
  });
});
