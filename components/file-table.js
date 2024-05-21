// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import SortableGrid from "./sortable-grid";
import Status from "./status";
// lib
import { dataSize, truthyOrZero } from "../lib/general";

const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => <FileAccessionAndDownload file={source} />,
  },
  {
    id: "file_format",
    title: "File Format",
    sorter: (item) => item.file_format.toLowerCase(),
  },
  {
    id: "content_type",
    title: "Content Type",
    sorter: (item) => item.content_type.toLowerCase(),
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
    sorter: (item) => (item.lab ? item.lab.title.toLowerCase() : ""),
  },
  {
    id: "file_size",
    title: "File Size",
    display: ({ source }) =>
      truthyOrZero(source.file_size) ? dataSize(source.file_size) : "",
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display a sortable table of the given files.
 */
export default function FileTable({
  files,
  title = "Files",
  reportLink = "",
  reportLabel = "",
  fileSetPath = "",
}) {
  const finalReportLink = fileSetPath
    ? `/multireport/?type=File&file_set=${encodeURIComponent(fileSetPath)}`
    : reportLink;
  const label = fileSetPath
    ? "Report of files that have this item as their file set"
    : reportLabel;

  return (
    <>
      <DataAreaTitle>
        {title}
        {finalReportLink && (
          <DataAreaTitleLink href={finalReportLink} label={label}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <SortableGrid
        data={files}
        columns={filesColumns}
        keyProp="@id"
        pager={{}}
      />
    </>
  );
}

FileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table; can be a string or a React component
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  // Full report link for file tables not on FileSet pages
  reportLink: PropTypes.string,
  // Label for the report link when `reportLink` used instead of `fileSetPath`
  reportLabel: PropTypes.string,
  // For the report link on FileSet pages, the path to this FileSet page
  fileSetPath: PropTypes.string,
};
