// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { BatchDownloadActuator } from "./batch-download";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import SortableGrid from "./sortable-grid";
import Status from "./status";
// lib
import { FileSetController } from "../lib/batch-download";
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
  fileSet = null,
  title = "Files",
  reportLink = "",
  reportLabel = "",
  downloadQuery = null,
  isDownloadable = false,
}) {
  // Compose the report link, either from the file set or the given link and label.
  const finalReportLink = fileSet
    ? `/multireport/?type=File&file_set=${encodeURIComponent(fileSet["@id"])}`
    : reportLink;
  const label = fileSet
    ? "Report of files that have this item as their file set"
    : reportLabel;

  // Create a batch-download controller if a file set is provided.
  const controller =
    fileSet && isDownloadable
      ? new FileSetController(fileSet, downloadQuery)
      : null;

  return (
    <>
      <DataAreaTitle>
        {title}
        {(controller || finalReportLink) && (
          <div className="flex gap-1">
            {controller && (
              <BatchDownloadActuator
                controller={controller}
                label="Download files associated with this file set"
                size="sm"
              />
            )}
            {finalReportLink && (
              <DataAreaTitleLink href={finalReportLink} label={label}>
                <TableCellsIcon className="h-4 w-4" />
              </DataAreaTitleLink>
            )}
          </div>
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
  // FileSet object containing these files; used for report link and batch download
  fileSet: PropTypes.object,
  // Title for the table; can be a string or a React component
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  // Full report link for file tables not on FileSet pages, i.e. without `fileSet`
  reportLink: PropTypes.string,
  // Label for the report link for file tables not on FileSet pages, i.e. without `fileSet`
  reportLabel: PropTypes.string,
  // Extra query parameters for downloading files, if needed
  downloadQuery: PropTypes.object,
  // True if the user can download the files in this table
  isDownloadable: PropTypes.bool,
};
