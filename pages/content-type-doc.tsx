// node_modules
import _ from "lodash";
import { type GetServerSidePropsContext } from "next";
import { Fragment } from "react";
// components
import { DataAreaTitle } from "../components/data-area";
import Link from "../components/link-no-prefetch";
import MarkdownSection from "../components/markdown-section";
import PagePreamble from "../components/page-preamble";
import { useSecDir } from "../components/section-directory";
import SortableGrid, {
  type SortableGridConfig,
} from "../components/sortable-grid";
// lib
import {
  buildFileTypeEntry,
  getContentTypeDocContent,
  type ContentTypeDoc,
  type ContentTypeDocEntry,
  type FileTypeEntry,
} from "../lib/content-type-doc";
import { toShishkebabCase } from "../lib/general";
import { retrieveProfiles } from "../lib/server-objects";

/**
 * Fallback content to display on the page if `/content-type-doc-content/` page doesn't exist or
 * doesn't contain any content.
 */
const fallbackPageContent =
  "Display introductory text here about content types as the first markdown block of the `/content-type-doc-content/` page.";

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
 * Renders a list of file formats associated with a file type.
 *
 * @param fileTypeEntry - The file-type entry containing the file formats displayed in the list
 */
function FileFormatsList({ fileTypeEntry }: { fileTypeEntry: FileTypeEntry }) {
  const fileFormats = _.sortBy(fileTypeEntry.fileFormats, (format) =>
    format.toLowerCase()
  );

  return (
    <ul className="flex flex-wrap gap-0.5">
      {fileFormats.map((format) => (
        <li
          key={format}
          className="bg-gray-300 px-1 text-xs font-semibold uppercase dark:bg-gray-600"
        >
          {format}
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders the subtitle for a file-type entry, including its description and file formats.
 *
 * @param fileTypeEntry - File type entry containing the data to display in the subtitle
 */
function Subtitle({ fileTypeEntry }: { fileTypeEntry: FileTypeEntry }) {
  return (
    <div className="-mt-0.5 mb-1">
      <FileFormatsList fileTypeEntry={fileTypeEntry} />
      <p className="my-1 text-sm leading-[1.3] text-gray-500 dark:text-gray-400">
        {fileTypeEntry.fileTypeDescription}
      </p>
    </div>
  );
}

/**
 * Page component for displaying content type documentation. The documentation is organized by file
 * type, where each file type has a list of content types with their corresponding descriptions.
 *
 * @param contentTypeDoc - Content type documentation data to be rendered on the page
 * @param pageContent - Markdown to display between page title and content-type tables
 */
export default function ContentTypeDoc({
  contentTypeDoc,
  pageContent,
}: {
  contentTypeDoc: ContentTypeDoc;
  pageContent: string;
}) {
  const sections = useSecDir();

  if (Object.keys(contentTypeDoc).length === 0) {
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
      {pageContent && (
        <div className="my-4">
          <MarkdownSection>{pageContent}</MarkdownSection>
        </div>
      )}
      {Object.entries(contentTypeDoc)
        .filter(([, entry]) => entry.contentTypes.length > 0)
        .map(([fileType, fileTypeEntry]) => {
          const encodedFileType = toShishkebabCase(fileType);

          return (
            <Fragment key={fileType}>
              <DataAreaTitle
                id={`file-type-${encodedFileType}`}
                className="mb-0"
              >
                <Link href={fileTypeEntry.profilePagePath}>
                  {fileTypeEntry.title}
                </Link>
              </DataAreaTitle>
              <Subtitle fileTypeEntry={fileTypeEntry} />
              <SortableGrid
                data={fileTypeEntry.contentTypes}
                columns={contentTypeColumns}
                isTotalCountHidden
                isPagerHidden
              />
            </Fragment>
          );
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
export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<{
  props: {
    contentTypeDoc: ContentTypeDoc;
    pageContent: string;
    pageContext: { title: string };
  };
}> {
  // Get and cache `/profiles` schema data.
  const profiles = await retrieveProfiles(req.headers.cookie ?? "");

  // Build the content type documentation based on the concrete file types defined in the profiles.
  const contentTypeDoc: ContentTypeDoc = {};
  let pageContent = "";
  if (profiles) {
    // Get the content for the page from the `/content-type-doc-content/` Page object. The Markdown
    // text is expected in the body of the first block of the page.
    pageContent =
      (await getContentTypeDocContent(req.headers.cookie ?? "")) ??
      fallbackPageContent;

    // Get all concrete types that are subtypes of `File`.
    const fileConcreteTypes = profiles._subtypes?.File ?? [];

    // Each concrete file type has a `content_type` property with enum values and descriptions.
    // Extract those to build the documentation object.
    fileConcreteTypes.forEach((type) => {
      // Get the current file type's `content_type` property schema. `content_type` is currently
      // required for all file types, but we check for its existence just in case.
      const fileTypeEntry = buildFileTypeEntry(type, profiles);
      if (fileTypeEntry) {
        contentTypeDoc[type] = fileTypeEntry;
      }
    });
  }

  // Return the content type documentation as props to be rendered on the page.
  return {
    props: {
      contentTypeDoc,
      pageContent: pageContent ?? fallbackPageContent,
      pageContext: { title: "File Content Type Documentation" },
    },
  };
}
