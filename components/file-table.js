// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { AnnotatedValue } from "./annotated-value";
import { BatchDownloadActuator } from "./batch-download";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import { WorkflowList } from "./workflow";
// lib
import { FileTableController } from "../lib/batch-download";
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
    display: ({ source }) =>
      source.content_type ? (
        <AnnotatedValue
          objectType={source["@type"][0]}
          propertyName="content_type"
        >
          {source.content_type}
        </AnnotatedValue>
      ) : null,
    sorter: (item) => (item.content_type || "Z").toLowerCase(),
  },
  {
    id: "summary",
    title: "Summary",
  },
  {
    id: "workflows",
    title: "Workflows",
    display: ({ source }) => {
      const workflows = source.workflows || [];
      return <WorkflowList workflows={workflows} />;
    },
    hide: (data) => {
      const anyWorkflows = data.some((item) => item.workflows?.length > 0);
      return !anyWorkflows;
    },
    isSortable: false,
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
    id: "filtered",
    title: "Filtered",
    display: ({ source }) => {
      return source.filtered ? <Status status="filtered" /> : null;
    },
    sorter: (item) => (item.filtered ? 0 : 1),
    hide: (data, columns, meta) => {
      if (!meta.isFilteredVisible) {
        return true;
      }

      // Only show this column if the files have a mix of filtered and unfiltered statuses.
      const filtered = data.map((item) => Boolean(item.filtered));
      const filteredValues = new Set(filtered);
      return filteredValues.size === 1;
    },
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
  controllerContent = null,
  isFilteredVisible = false,
  isDeletedVisible = false,
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
  const controller = fileSet
    ? new FileTableController(fileSet, downloadQuery)
    : null;

  const sortableGrid = (
    <SortableGrid
      data={files}
      columns={filesColumns}
      keyProp="@id"
      meta={{ isFilteredVisible }}
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
              <DataAreaTitleLink
                href={finalReportLink}
                label={label}
                isDeletedVisible={isDeletedVisible}
              >
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
  // Extra text or JSX content for the batch download controller
  controllerContent: PropTypes.node,
  // True to show the "Filtered" column if both filtered and unfiltered files exist
  isFilteredVisible: PropTypes.bool,
  // True to include deleted files in the linked report
  isDeletedVisible: PropTypes.bool,
  // Unique ID for the table for the section directory
  panelId: PropTypes.string,
};
