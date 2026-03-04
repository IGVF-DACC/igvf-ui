// lib
import FetchRequest from "./fetch-request";
import { type PageObject } from "./page";
// root
import type { Profiles, Schema, SchemaProperty } from "../globals";

/**
 * Type definition for a content type documentation entry, which includes the content type's name
 * and description.
 *
 * @property name - Name of the content type from the schema property enum values
 * @property description - Description of the content type from the schema property enum
 *                         descriptions
 */
export type ContentTypeDocEntry = {
  name: string;
  description: string;
};

/**
 * Contains the displayable data for each file type.
 *
 * @property title - Human-readable title for the file type, e.g. "Reference File"
 * @property fileTypeDescription - Description of the file type from the schema
 * @property fileFormats - Allowed file formats associated with the file type; from `file_format`
 * @property profilePagePath - Path to the profile page for the file type
 * @property contentTypes - Content types for a file type and their descriptions
 */
export type FileTypeEntry = {
  title: string;
  fileTypeDescription: string;
  fileFormats: string[];
  profilePagePath: string;
  contentTypes: ContentTypeDocEntry[];
};

/**
 * Type definition for the content type documentation object. It maps each file-derived object type
 * to their corresponding displayable documentation entries for the content-type-doc page.
 */
export type ContentTypeDoc = Record<string, FileTypeEntry>;

/**
 * Fetches the content type documentation content from the first block of a page at a specific
 * path: `/content-type-doc-content/`. If the request for this page wasn't successful or if that
 * page contains no content, this function returns null. Otherwise this function returns the
 * markdown content.
 *
 * @param cookie - Session cookie used for authentication when making the request
 * @returns A promise that resolves to the content type documentation content as markdown
 */
export async function getContentTypeDocContent(
  cookie: string
): Promise<string | null> {
  const request = new FetchRequest({ cookie });
  const response = (
    await request.getObject("/content-type-doc-content/")
  ).union();
  if (FetchRequest.isResponseSuccess(response)) {
    const page = response as PageObject;
    const blocks = page.layout?.blocks;
    if (blocks && blocks.length > 0) {
      const body = blocks[0].body.trim();
      if (body.length > 0) {
        return body;
      }
    }
  }
  return null;
}

/**
 * Builds the content-type documentation entries for a specific file type based on the enum values and
 * enum descriptions defined in the `content_type` property of the file type's schema. If there are no
 * enum values defined for the `content_type` property, this function returns an empty array.
 *
 * @param contentTypeProp - Schema properties for `content_type`
 * @returns name and corresponding descriptions of each content type in `contentTypeProp`
 */
function buildContentTypeDocEntries(
  contentTypeProp: SchemaProperty
): ContentTypeDocEntry[] {
  return (contentTypeProp.enum ?? []).map((enumVal) => ({
    name: enumVal,
    description:
      contentTypeProp.enum_descriptions?.[enumVal] ?? "No description",
  }));
}

/**
 * Builds the content type documentation entry for a specific file type. If the file type doesn't
 * have a `content_type` property this function returns undefined.
 *
 * @param type - File `@type` to build the file-type entry
 * @param profiles - Schemas for all types, from `/profiles`
 * @returns File-type entry for the given file type
 */
export function buildFileTypeEntry(
  type: string,
  profiles: Profiles
): FileTypeEntry | undefined {
  let contentTypeDoc: FileTypeEntry | undefined;
  const fileTypeSchema = profiles[type] as Schema | undefined;
  if (fileTypeSchema) {
    const fileTypeProps = fileTypeSchema.properties;
    const contentTypeProp = fileTypeProps.content_type;
    if (contentTypeProp) {
      const fileFormatProp = fileTypeProps.file_format;
      const contentTypes = buildContentTypeDocEntries(contentTypeProp);
      if (contentTypes.length > 0) {
        contentTypeDoc = {
          title: fileTypeSchema.title,
          fileTypeDescription: fileTypeSchema.description ?? "No description",
          fileFormats: fileFormatProp?.enum ?? [],
          profilePagePath: fileTypeSchema.$id.replace(/\.json$/, "/"),
          contentTypes,
        };
      }
    }
  }
  return contentTypeDoc;
}
