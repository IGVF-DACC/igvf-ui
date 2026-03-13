jest.mock("next/config", () => () => ({
  serverRuntimeConfig: {
    BACKEND_URL: "http://localhost:8000",
  },
  publicRuntimeConfig: {
    SERVER_URL: "http://localhost:3000",
    PUBLIC_BACKEND_URL: "http://localhost:8000",
  },
}));

jest.mock("../fetch-request", () => {
  const actual = jest.requireActual("../fetch-request");
  return {
    __esModule: true,
    default: Object.assign(jest.fn(), {
      isResponseSuccess: actual.default.isResponseSuccess,
    }),
  };
});

import FetchRequest from "../fetch-request";
import {
  buildFileTypeEntry,
  getContentTypeDocContent,
} from "../content-type-doc";
import type { Profiles, Schema } from "../../globals";

const MockFetchRequest = FetchRequest as jest.MockedClass<typeof FetchRequest>;

describe("getContentTypeDocContent", () => {
  let mockFetchRequest: { getObject: jest.Mock };

  beforeEach(() => {
    mockFetchRequest = {
      getObject: jest.fn(),
    };
    MockFetchRequest.mockImplementation(() => mockFetchRequest as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("returns the first block body when response is successful and blocks exist", async () => {
    const body = "# Content Type Doc\nSome markdown content";
    mockFetchRequest.getObject.mockReturnValue({
      union: () => ({
        "@type": ["Page"],
        "@id": "/content-type-doc-content/",
        name: "content-type-doc-content",
        title: "Content Type Doc Content",
        layout: {
          blocks: [{ body }, { body: "second block" }],
        },
      }),
    });

    const result = await getContentTypeDocContent("test-cookie");

    expect(MockFetchRequest).toHaveBeenCalledWith({ cookie: "test-cookie" });
    expect(mockFetchRequest.getObject).toHaveBeenCalledWith(
      "/content-type-doc-content/"
    );
    expect(result).toBe(body);
  });

  it("returns null when response is successful but layout has no blocks", async () => {
    mockFetchRequest.getObject.mockReturnValue({
      union: () => ({
        "@type": ["Page"],
        "@id": "/content-type-doc-content/",
        name: "content-type-doc-content",
        title: "Content Type Doc Content",
        layout: { blocks: [] },
      }),
    });

    const result = await getContentTypeDocContent("test-cookie");

    expect(result).toBeNull();
  });

  it("returns null when response is successful but layout is undefined", async () => {
    mockFetchRequest.getObject.mockReturnValue({
      union: () => ({
        "@type": ["Page"],
        "@id": "/content-type-doc-content/",
        name: "content-type-doc-content",
        title: "Content Type Doc Content",
      }),
    });

    const result = await getContentTypeDocContent("test-cookie");

    expect(result).toBeNull();
  });

  it("returns null when the response is not successful", async () => {
    mockFetchRequest.getObject.mockReturnValue({
      union: () => ({
        "@type": ["HTTPNotFound", "Error"],
        code: 404,
        description: "The resource could not be found.",
        detail: "/content-type-doc-content/",
        status: "error",
        title: "Not Found",
        isError: true,
      }),
    });

    const result = await getContentTypeDocContent("test-cookie");

    expect(result).toBeNull();
  });
});

describe("buildFileTypeEntry", () => {
  const baseSchema: Schema = {
    $id: "/profiles/AlignmentFile.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    "@type": ["JSONSchema"],
    additionalProperties: false,
    mixinProperties: [],
    title: "Alignment File",
    description: "A file containing alignments.",
    type: "object",
    properties: {
      content_type: {
        title: "Content Type",
        type: "string",
        enum: ["alignments", "transcriptome alignments"],
        enum_descriptions: {
          alignments: "Genomic alignments of reads.",
          "transcriptome alignments": "Transcriptomic alignments of reads.",
        },
      },
      file_format: {
        title: "File Format",
        type: "string",
        enum: ["bam", "cram"],
      },
    },
  };

  function makeProfiles(schema?: Schema): Profiles {
    return {
      "@type": ["JSONSchemas"],
      _hierarchy: { Item: {} },
      _subtypes: {},
      ...(schema ? { AlignmentFile: schema } : {}),
    } as Profiles;
  }

  it("returns a FileTypeEntry with all fields populated", () => {
    const profiles = makeProfiles(baseSchema);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).toEqual({
      title: "Alignment File",
      fileTypeDescription: "A file containing alignments.",
      fileFormats: ["bam", "cram"],
      profilePagePath: "/profiles/AlignmentFile/",
      contentTypes: [
        { name: "alignments", description: "Genomic alignments of reads." },
        {
          name: "transcriptome alignments",
          description: "Transcriptomic alignments of reads.",
        },
      ],
    });
  });

  it("returns undefined when the type is not present in profiles", () => {
    const profiles = makeProfiles();
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).toBeUndefined();
  });

  it("returns undefined when the schema has no content_type property", () => {
    const schemaWithoutContentType: Schema = {
      ...baseSchema,
      properties: {
        file_format: baseSchema.properties.file_format,
      },
    };
    const profiles = makeProfiles(schemaWithoutContentType);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).toBeUndefined();
  });

  it("returns an entry with empty contentTypes when content_type has no enum values", () => {
    const schemaNoEnum: Schema = {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        content_type: {
          title: "Content Type",
          type: "string",
        },
      },
    };
    const profiles = makeProfiles(schemaNoEnum);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).toBeUndefined();
  });

  it("returns an entry with empty fileFormats when file_format has no enum values", () => {
    const schemaNoFileFormatEnum: Schema = {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        file_format: {
          title: "File Format",
          type: "string",
        },
      },
    };
    const profiles = makeProfiles(schemaNoFileFormatEnum);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).not.toBeUndefined();
    expect(result!.fileFormats).toEqual([]);
  });

  it("returns an entry with empty fileFormats when file_format property is absent", () => {
    const schemaNoFileFormat: Schema = {
      ...baseSchema,
      properties: {
        content_type: baseSchema.properties.content_type,
      },
    };
    const profiles = makeProfiles(schemaNoFileFormat);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).not.toBeUndefined();
    expect(result!.fileFormats).toEqual([]);
  });

  it("uses 'No description' fallback when enum_descriptions is absent", () => {
    const schemaNoDescriptions: Schema = {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        content_type: {
          title: "Content Type",
          type: "string",
          enum: ["alignments"],
        },
      },
    };
    const profiles = makeProfiles(schemaNoDescriptions);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).not.toBeUndefined();
    expect(result!.contentTypes).toEqual([
      { name: "alignments", description: "No description" },
    ]);
  });

  it("uses 'No description' fallback for enum values missing from enum_descriptions", () => {
    const schemaPartialDescriptions: Schema = {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        content_type: {
          title: "Content Type",
          type: "string",
          enum: ["alignments", "transcriptome alignments"],
          enum_descriptions: {
            alignments: "Genomic alignments of reads.",
            // "transcriptome alignments" is intentionally missing
          },
        },
      },
    };
    const profiles = makeProfiles(schemaPartialDescriptions);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).not.toBeUndefined();
    expect(result!.contentTypes).toEqual([
      { name: "alignments", description: "Genomic alignments of reads." },
      { name: "transcriptome alignments", description: "No description" },
    ]);
  });

  it("uses 'No description' fallback when schema has no description", () => {
    const schemaNoDescription: Schema = {
      ...baseSchema,
      description: undefined,
    };
    const profiles = makeProfiles(schemaNoDescription);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result).not.toBeUndefined();
    expect(result!.fileTypeDescription).toBe("No description");
  });

  it("strips the .json suffix from $id to build profilePagePath", () => {
    const profiles = makeProfiles(baseSchema);
    const result = buildFileTypeEntry("AlignmentFile", profiles);

    expect(result!.profilePagePath).toBe("/profiles/AlignmentFile/");
  });
});
