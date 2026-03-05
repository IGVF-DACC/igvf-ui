// node_modules
import _ from "lodash";
import { type GetServerSidePropsContext } from "next";
// components
import { DataAreaTitle } from "../components/data-area";
import PagePreamble from "../components/page-preamble";
import { useSecDir } from "../components/section-directory";
import SortableGrid, {
  type SortableGridConfig,
} from "../components/sortable-grid";
// lib
import { retrieveProfiles } from "../lib/server-objects";
// root
import type { Schema } from "../globals";
import { Fragment } from "react";

/**
 * Type definition for a content type documentation entry, which includes the content type's name
 * and description. Each entry represents a specific content type that can be associated with a
 * file type in the documentation.
 *
 * @property name - Name of the content type from the schema property enum values
 * @property description - Description of the content type from the schema property enum
 *                         descriptions
 */
type ContentTypeDocEntry = {
  name: string;
  description: string;
};

type ContentTypeDoc = Record<string, ContentTypeDocEntry[]>;

/**
 * Configuration for the sortable grid columns used to display content type documentation entries. Each entry
 * represents a column in the grid, with an ID, title, and optional sorting configuration.
 */
const contentTypeColumns: SortableGridConfig<ContentTypeDocEntry>[] = [
  {
    id: "name",
    title: "Content Type",
    isSortable: false,
    sorter: (item) => item.name.toLowerCase(),
  },
  {
    id: "description",
    title: "Description",
    isSortable: false,
  },
];

/**
 * Page component for displaying content type documentation. The documentation is organized by file
 * type, where each file type has a list of content types with their corresponding descriptions.
 *
 * @param contentTypeDoc - Content type documentation data to be rendered on the page
 */
export default function ContentTypeDoc({
  contentTypeDoc,
}: {
  contentTypeDoc: ContentTypeDoc;
}) {
  const sections = useSecDir();

  if (_.isEmpty(contentTypeDoc)) {
    return (
      <>
        <PagePreamble sections={sections} />
        <p>No content type documentation available.</p>
      </>
    );
  }

  return (
    <>
      <PagePreamble sections={sections} />
      {Object.entries(contentTypeDoc).map(([fileType, contentTypes]) => {
        if (contentTypes.length > 0) {
          return (
            <Fragment key={fileType}>
              <DataAreaTitle id={`file-type-${fileType}`}>
                {fileType}
              </DataAreaTitle>
              <SortableGrid
                data={contentTypes}
                columns={contentTypeColumns}
                isTotalCountHidden
                isPagerHidden
              />
            </Fragment>
          );
        }
      })}
    </>
  );
}

/**
 * Retrieves the content type documentation data on the server side by accessing the `/profiles`
 * schema and extracting the relevant information from concrete file types' `content_type` property
 * enums and descriptions.
 *
 * @param req - Request object used to access cookies for the request.
 * @returns Content type documentation to be rendered on the page.
 */
export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  // Get and cache `/profiles` schema data.
  const profiles = await retrieveProfiles(req.headers.cookie ?? "");

  // Build the content type documentation based on the concrete file types defined in the profiles.
  const contentTypeDoc: ContentTypeDoc = {};
  if (profiles) {
    // Get all concrete types that are subtypes of `File`.
    const fileConcreteTypes = profiles._subtypes?.File ?? [];

    // Each concrete file type has a `content_type` property with enum values and descriptions.
    // Extract those to build the documentation object.
    fileConcreteTypes.forEach((type) => {
      // Get the current file type's `content_type` property schema. `content_type` is currently
      // required for all file types, but we check for its existence just in case.
      const fileTypeSchema = (profiles[type] ?? {}) as Schema;
      const fileTypeProps = fileTypeSchema.properties ?? {};
      const contentTypeProp = fileTypeProps.content_type;
      if (contentTypeProp) {
        // For each enum value, get the corresponding descriptions to build the documentation entry
        // for this file type.
        contentTypeDoc[type] = (contentTypeProp.enum || []).map((enumVal) => {
          const description =
            contentTypeProp.enum_descriptions?.[enumVal] ?? "No description";
          return {
            name: enumVal,
            description,
          };
        });
      }
    });
  }

  // Return the content type documentation as props to be rendered on the page.
  return {
    props: { contentTypeDoc },
  };
}
