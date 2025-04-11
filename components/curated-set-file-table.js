// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { BatchDownloadActuator } from "./batch-download";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import SortableGrid from "./sortable-grid";
import Status from "./status";
// lib
import { FileSetController } from "../lib/batch-download";
import { dataSize, truthyOrZero } from "../lib/general";

const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <div className="flex items-start gap-1">
        <FileAccessionAndDownload file={source} />
        <HostedFilePreview file={source} buttonSize="sm" />
      </div>
    ),
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
    id: "summary",
    title: "Summary",
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
    id: "submitted_file_name",
    title: "Submitted File Name",
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
export function CuratedSetFileTable({
  files,
  fileSet = null,
  title = "Files",
  reportLink = "",
  reportLabel = "",
  downloadQuery = null,
  isDownloadable = false,
  controllerContent = null,
  panelId = "files",
}) {
  // Compose the report link, either from the file set or the given link and label.
  const finalReportLink = fileSet
    ? `/multireport/?type=File&file_set.@id=${encodeURIComponent(
        fileSet["@id"]
      )}`
    : reportLink;
  const label = fileSet
    ? "Report of files that have this item as their file set"
    : reportLabel;

  // Create a batch-download controller if a file set is provided.
  const controller =
    fileSet && isDownloadable
      ? new FileSetController(fileSet, downloadQuery)
      : null;

  const sortableGrid = (
    <SortableGrid
      data={files}
      columns={filesColumns}
      keyProp="@id"
      pager={{}}
    />
  );

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {(controller || finalReportLink) && (
          <div className="align-center flex gap-1">
            {controller && (
              <BatchDownloadActuator
                controller={controller}
                label="Download files associated with this file set"
                size="sm"
              />
            )}
            {controllerContent}
            {finalReportLink && (
              <DataAreaTitleLink href={finalReportLink} label={label}>
                <TableCellsIcon className="h-4 w-4" />
              </DataAreaTitleLink>
            )}
          </div>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">{sortableGrid}</div>
    </>
  );
}

CuratedSetFileTable.propTypes = {
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
  // Extra text or JSX content for the batch download controller
  controllerContent: PropTypes.node,
  // Unique ID for the table for the section directory
  panelId: PropTypes.string,
};
