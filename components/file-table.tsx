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
import { isEmbedded, isEmbeddedArray } from "../lib/types";
// root
import type { FileObject, FileSetObject } from "../globals";

type FileTableMeta = {
  isFilteredVisible: boolean;
};

const filesColumns: SortableGridConfig<FileObject, FileTableMeta>[] = [
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
    sorter: (item) => (item.content_type || "\uffff").toLowerCase(),
  },
  {
    id: "summary",
    title: "Summary",
  },
  {
    id: "workflows",
    title: "Workflows",
    display: ({ source }) => {
      if (source.workflows && isEmbeddedArray(source.workflows)) {
        return <WorkflowList workflows={source.workflows} />;
      }

      // `derived_manually` might be set for files without a `workflows` array.
      if (source.derived_manually) {
        return <Status status="derived manually" />;
      }
      return null;
    },
    hide: (files) =>
      // Hide the Workflows column if no files have workflows nor derived_manually set.
      !files.some(
        (item) =>
          (item.workflows && isEmbeddedArray(item.workflows)) ||
          item.derived_manually
      ),
    isSortable: false,
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) =>
      source.lab && isEmbedded(source.lab) ? source.lab.title : null,
    sorter: (item) =>
      item.lab && isEmbedded(item.lab)
        ? item.lab.title.toLowerCase()
        : "\uffff",
  },
  {
    id: "file_size",
    title: "File Size",
    display: ({ source }) =>
      source.file_size !== undefined ? dataSize(source.file_size) : "",
  },
  {
    id: "filtered",
    title: "Filtered",
    display: ({ source }) =>
      source.filtered ? <Status status="filtered" /> : null,
    sorter: (item) => (item.filtered ? 0 : 1),
    hide: (data, columns, meta) => {
      if (!meta.isFilteredVisible) {
        return true;
      }

      // Only show this column if at least one file has the filtered flag set to true
      return !data.some((item) => item.filtered);
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
 *
 * @param files - Array of file objects to display in the table
 * @param fileSet - Optional file set object to associate with the table for batch download / report links
 * @param title - Optional title for the table section
 * @param reportLink - Optional URL for a report link
 * @param reportLabel - Optional label for the report link
 * @param controllerContent - Optional additional content to render alongside the batch download controller
 * @param isFilteredVisible - Optional flag to control visibility of the filtered column
 * @param isDeletedVisible - Optional flag to control visibility of deleted files
 * @param hasDeprecatedOption - Optional flag indicating whether deprecated file toggle should be shown
 * @param externalDeprecated - Optional external control for deprecated file visibility
 * @param secDirTitle - Optional secondary directory title for the data area
 * @param panelId - Optional id for the data area panel
 */
export default function FileTable({
  files,
  fileSet,
  title = "Files",
  reportLink = "",
  reportLabel = "",
  controllerContent,
  isFilteredVisible = false,
  isDeletedVisible = false,
  hasDeprecatedOption = false,
  externalDeprecated,
  secDirTitle = "Files",
  panelId = "files",
}: {
  files: FileObject[];
  fileSet?: FileSetObject;
  title?: string;
  reportLink?: string;
  reportLabel?: string;
  controllerContent?: React.ReactNode;
  isFilteredVisible?: boolean;
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
  const controller = fileSet ? new FileTableController(fileSet) : null;

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
            meta={{ isFilteredVisible }}
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
