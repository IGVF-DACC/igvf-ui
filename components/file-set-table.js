// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import LinkedIdAndStatus from "./linked-id-and-status";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
import SortableGrid from "./sortable-grid";
import { AliasesCell } from "./table-cells";

const fileSetColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
  },
  {
    id: "file_set_type",
    title: "File Set Type",
    sorter: (item) => item.file_set_type.toLowerCase(),
  },
  {
    id: "summary",
    title: "Summary",
    isSortable: false,
  },
  {
    id: "files",
    title: "Files",
    display: ({ source, meta }) => {
      if (source.files?.length > 0) {
        const files = meta.fileSetMeta?.fileFilter
          ? meta.fileSetMeta.fileFilter(source.files)
          : source.files;
        return (
          <SeparatedList>
            {files.map((file) => (
              <Link key={file["@id"]} href={file["@id"]}>
                {file.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
    },
    hide: (data, columns, meta) => {
      if (meta.fileSetMeta?.showFileSetFiles) {
        // Hide the column if the client didn't request it, or if they did but there are no files
        // to display after filtering, if the client provided a filter function.
        const allFiles = data.reduce(
          (acc, fileSet) => acc.concat(fileSet.files),
          []
        );
        const filteredFiles = meta.fileSetMeta?.fileFilter
          ? meta.fileSetMeta.fileFilter(allFiles)
          : allFiles;
        return filteredFiles.length === 0;
      }
      return true;
    },
    isSortable: false,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title || null,
    sorter: (item) => (item.lab?.title ? item.lab.title.toLowerCase() : ""),
  },
];

/**
 * Display a sortable table of the given file sets. Optionally display a link to a report page of
 * the file sets in this table. To allow this report link to work, the file sets in this table
 * must each include a link back to the currently displayed item.
 *
 * If you want a link to the report page, you must provide either the `reportLink` or
 * `reportLinkSpecs` property (not both). If you provide `reportLink`, it must contain the
 * complete path of the report page. If you provide `reportLinkSpecs`, it must contain the
 * properties needed to construct the URL of the report page. The `reportLinkSpecs` object must
 * contain the following properties:
 *
 * - fileSetType: `@type` of the file sets referring to the currently displayed item. The report page
 *   displays only objects of this type. You can use the `FileSet` abstract type if needed here.
 *
 * - identifierProp: Property of the report items that links back to the currently displayed item
 *
 * - itemIdentifier: ID of the currently displayed item that the report items link back to.
 *
 * You can optionally display a Files column in the table. Each cell of this column shows linked
 * accessions of files belonging to the file set displayed in that row. To show this column,
 * include the `fileSetMeta` property with the following properties:
 *
 * - showFileSetFiles: True to show the Files column
 *
 * - fileFilter: Optional function to filter the files to display in the Files column. This
 *   function takes an array of file objects displayed in the cell of the File column and returns
 *   an array of file objects to include in the cell. If you don't provide this function, the cell
 *   displays all files belonging to the file set in the row.
 */
export default function FileSetTable({
  fileSets,
  reportLink = "",
  reportLabel = "",
  title = "File Sets",
  fileSetMeta = null,
  panelId = "file-sets",
}) {
  const { collectionTitles } = useContext(SessionContext);

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={fileSets}
          columns={fileSetColumns}
          keyProp="@id"
          meta={{ fileSetMeta, collectionTitles }}
          pager={{}}
        />
      </div>
    </>
  );
}

FileSetTable.propTypes = {
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same file sets as this table
  reportLink: PropTypes.string,
  // Label for the report link
  reportLabel: PropTypes.string,
  // Title of the table if not "File Sets"
  title: PropTypes.string,
  // Metadata for display options
  fileSetMeta: PropTypes.exact({
    // True to show a column for the files belonging to each file set
    showFileSetFiles: PropTypes.bool,
    // Function to filter the files to display
    fileFilter: PropTypes.func,
  }),
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
