// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import { useState, type ReactNode } from "react";
// components
import { AnnotatedValue } from "./annotated-value";
import { BatchDownloadActuator } from "./batch-download";
import { DataAreaTitle, DataPanel, DataAreaTitleLink } from "./data-area";
import { DeprecatedFileFilterControl } from "./deprecated-files";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import {
  imageFileHasThumbnail,
  ImageFileThumbnailAndPreview,
} from "./image-file-thumbnail";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
import Status from "./status";
// lib
import { FileTableController } from "../lib/batch-download";
import { isDatabaseObject } from "../lib/database-object";
import {
  computeFileDisplayData,
  resolveDeprecatedFileProps,
} from "../lib/deprecated-files";
import { type FileSetObject } from "../lib/file-sets";
import { dataSize, truthyOrZero } from "../lib/general";
// root
import type { FileObject } from "../globals";

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
    id: "href",
    title: "Preview",
    display: ({ source }) =>
      imageFileHasThumbnail(source) ? (
        <ImageFileThumbnailAndPreview imageFile={source} size={120} />
      ) : null,
    hide: (data) => {
      const anyPreviews = data.some((item) => imageFileHasThumbnail(item));
      return !anyPreviews;
    },
    isSortable: false,
  },
  {
    id: "content_type",
    title: "Content Type",
    display: ({ source }) => {
      return source.content_type ? (
        <AnnotatedValue
          objectType={source["@type"][0]}
          propertyName="content_type"
        >
          {source.content_type}
        </AnnotatedValue>
      ) : null;
    },
    sorter: (item) => (item.content_type || "z").toLowerCase(),
  },
  {
    id: "summary",
    title: "Summary",
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) =>
      isDatabaseObject(source.lab) ? source.lab.title : null,
    sorter: (item) =>
      isDatabaseObject(item.lab) && item.lab.title
        ? item.lab.title.toLowerCase()
        : "z",
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
    display: ({ source }) => (
      <div className="break-all">{source.submitted_file_name}</div>
    ),
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
 * @param files - List of file objects to display in the table
 * @param fileSet - File set object associated with the files
 * @param title - Optional title for the table
 * @param defaultDeprecatedVisible - Optional flag to control the default visibility of deprecated
 *                                   files
 * @param panelId - Optional ID for the panel containing the table
 */
export function CuratedSetFileTable({
  files,
  fileSet,
  title = "Files",
  defaultDeprecatedVisible = false,
  panelId = "files",
}: {
  files: FileObject[];
  fileSet: FileSetObject;
  title?: ReactNode;
  defaultDeprecatedVisible?: boolean;
  panelId?: string;
}) {
  // Local state for deprecated file visibility if not controlled externally via props
  const [deprecatedVisible, setDeprecatedVisible] = useState(
    defaultDeprecatedVisible
  );

  // Determine the deprecated file visibility and toggle control, either from props or local state.
  const resolvedDeprecated = resolveDeprecatedFileProps({
    visible: deprecatedVisible,
    setVisible: setDeprecatedVisible,
    defaultVisible: defaultDeprecatedVisible,
    controlTitle: "Include deprecated files",
  });

  // Compose the report link, either from the file set or the given link and label.
  const finalReportLink = `/multireport/?type=File&file_set.@id=${encodeURIComponent(
    fileSet["@id"]
  )}`;
  const label = "Report of files that have this item as their file set";

  // Create a batch-download controller if a file set is provided.
  const controller = new FileTableController(fileSet);

  // Filter out deprecated files if the user has not opted to include them.
  const { visibleFiles, showDeprecatedToggle } = computeFileDisplayData(
    files,
    resolvedDeprecated
  );

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {(controller || finalReportLink || showDeprecatedToggle) && (
          <div className="align-center flex gap-1">
            {showDeprecatedToggle && (
              <DeprecatedFileFilterControl
                panelId={panelId}
                deprecatedData={resolvedDeprecated}
              />
            )}
            {controller && (
              <BatchDownloadActuator
                controller={controller}
                label="Download files associated with this file set"
                size="sm"
              />
            )}
            {finalReportLink && (
              <DataAreaTitleLink
                href={finalReportLink}
                label={label}
                isDisabled={visibleFiles.length === 0}
                isDeprecatedVisible={resolvedDeprecated.visible}
              >
                <TableCellsIcon className="h-4 w-4" />
              </DataAreaTitleLink>
            )}
          </div>
        )}
      </DataAreaTitle>
      {visibleFiles.length === 0 ? (
        <DataPanel>
          <div className="text-center italic">
            No files to display. Select <b>Include deprecated files</b> to view
            these deprecated files.
          </div>
        </DataPanel>
      ) : (
        <div className="overflow-hidden">
          <SortableGrid
            data={visibleFiles}
            columns={filesColumns}
            keyProp="@id"
          />
        </div>
      )}
    </>
  );
}
