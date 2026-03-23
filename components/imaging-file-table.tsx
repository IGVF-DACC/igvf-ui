// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
// components
import { AnnotatedValue } from "./annotated-value";
import { BatchDownloadActuator } from "./batch-download";
import { DataAreaTitle, DataAreaTitleLink, DataPanel } from "./data-area";
import { DeprecatedFileFilterControl } from "./deprecated-files";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
import Status from "./status";
import { WorkflowList } from "./workflow";
// lib
import { FileTableController } from "../lib/batch-download";
import { UC } from "../lib/constants";
import {
  computeDefaultDeprecatedVisibility,
  computeFileDisplayData,
  resolveDeprecatedFileProps,
  type DeprecatedFileFilterProps,
} from "../lib/deprecated-files";
import { dataSize } from "../lib/general";
import QueryString from "../lib/query-string";
import { type WorkflowObject } from "../lib/workflow";
// root
import type { FileObject, FileSetObject } from "../globals";

const filesColumns: SortableGridConfig<FileObject>[] = [
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
    id: "imaging_platform",
    title: "Imaging Platform",
    display: ({ source }) => {
      if (
        typeof source.imaging_platform === "object" &&
        "term_name" in source.imaging_platform
      ) {
        return (
          <LinkedIdAndStatus item={source.imaging_platform}>
            {source.imaging_platform.term_name}
          </LinkedIdAndStatus>
        );
      }
      return null;
    },
    sorter: (item) =>
      typeof item.imaging_platform === "object" &&
      "term_name" in item.imaging_platform
        ? item.imaging_platform.term_name.toLowerCase()
        : "\uffff",
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
      const workflowObjects = workflows.filter(
        (workflow): workflow is WorkflowObject =>
          typeof workflow === "object" && typeof workflow["@id"] === "string"
      );
      return <WorkflowList workflows={workflowObjects} />;
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
    display: ({ source }) => {
      if (
        source.lab &&
        typeof source.lab === "object" &&
        "title" in source.lab
      ) {
        return <>{source.lab.title}</>;
      }
      return null;
    },
    sorter: (item) =>
      item.lab && typeof item.lab === "object" && "title" in item.lab
        ? item.lab.title.toLowerCase()
        : "",
  },
  {
    id: "file_size",
    title: "File Size",
    display: ({ source }) =>
      typeof source.file_size === "number" ? dataSize(source.file_size) : "",
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display a sortable table of the given imaging files.
 *
 * @param files - Files to display
 * @param fileSet - FileSet object containing these files; used for report link and batch download
 * @param title - Title for the table; can be a string or a React component
 * @param reportLink - Full report link for file tables not on FileSet pages, i.e. without `fileSet`
 * @param reportLabel - Label for the report link for file tables not on FileSet pages, i.e. without
 *                      `fileSet`
 * @param downloadQuery - Extra query parameters for downloading files, if needed
 * @param controllerContent - Extra text or JSX content for the batch download controller
 *                            files exist
 * @param isDeletedVisible - True to include deleted files in the linked report
 * @param hasDeprecatedOption - True allows user to toggle deprecated file visibility;
 *                              `externalDeprecated` ignored if false
 * @param externalDeprecated - Props related to viewing deprecated files; if not provided, defaults
 *                             to local state management
 * @param secDirTitle - Title for this table's section directory entry if not default
 * @param panelId - Unique ID for the table for the section directory
 */
export function ImagingFileTable({
  files,
  fileSet = null,
  title = "Files",
  reportLink = "",
  reportLabel = "",
  downloadQuery = null,
  controllerContent = null,
  isDeletedVisible = false,
  hasDeprecatedOption = false,
  externalDeprecated,
  secDirTitle = "Files",
  panelId = "files",
}: {
  files: FileObject[];
  fileSet?: FileSetObject;
  title?: string | React.ReactNode;
  reportLink?: string;
  reportLabel?: string;
  downloadQuery?: QueryString;
  controllerContent?: React.ReactNode;
  isDeletedVisible?: boolean;
  hasDeprecatedOption?: boolean;
  externalDeprecated?: DeprecatedFileFilterProps;
  secDirTitle?: string;
  panelId?: string;
}) {
  // Local state for deprecated file visibility if not controlled externally via props.
  const defaultDeprecatedVisible = computeDefaultDeprecatedVisibility(
    hasDeprecatedOption,
    externalDeprecated
  );
  const [deprecatedVisible, setDeprecatedVisible] = useState(
    defaultDeprecatedVisible
  );

  // Determine the deprecated file visibility and toggle control, either from props or local state.
  const localDeprecated = resolveDeprecatedFileProps(
    {
      visible: deprecatedVisible,
      setVisible: setDeprecatedVisible,
      defaultVisible: defaultDeprecatedVisible,
      controlTitle: "Include deprecated files",
    },
    externalDeprecated
  );

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

  // Filter out deprecated files if the user has not opted to include them.
  const { visibleFiles, showDeprecatedToggle } = computeFileDisplayData(
    files,
    localDeprecated
  );

  return (
    <>
      <DataAreaTitle id={panelId} secDirTitle={secDirTitle}>
        {title}
        {(controller || finalReportLink || hasDeprecatedOption) && (
          <div className="align-center flex gap-1">
            {hasDeprecatedOption && showDeprecatedToggle && (
              <DeprecatedFileFilterControl
                panelId={panelId}
                deprecatedData={localDeprecated}
              />
            )}
            {controller && (
              <BatchDownloadActuator
                controller={controller}
                label="Download files associated with this file set"
                size="sm"
                isDisabled={visibleFiles.length === 0}
              />
            )}
            {controllerContent}
            {finalReportLink && (
              <DataAreaTitleLink
                href={finalReportLink}
                label={label}
                isDeletedVisible={isDeletedVisible}
                isDisabled={visibleFiles.length === 0}
                isDeprecatedVisible={
                  !hasDeprecatedOption || localDeprecated.visible
                }
              >
                <TableCellsIcon className="h-4 w-4" />
              </DataAreaTitleLink>
            )}
          </div>
        )}
      </DataAreaTitle>
      {visibleFiles.length > 0 ? (
        <div className="overflow-hidden">
          <SortableGrid
            data={visibleFiles}
            columns={filesColumns}
            keyProp="@id"
          />
        </div>
      ) : (
        <DataPanel>
          The files don{UC.rsquo}t appear because they are deprecated. Select{" "}
          <b>Include deprecated files</b> to view the files.
        </DataPanel>
      )}
    </>
  );
}
