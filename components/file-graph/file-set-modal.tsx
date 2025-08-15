// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import { type Node } from "@xyflow/react";
// components
import AliasList from "../alias-list";
import {
  DataArea,
  DataAreaTitleLink,
  DataItemList,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../data-area";
import { FileAccessionAndDownload } from "../file-download";
import { HostedFilePreview } from "../hosted-file-preview";
import Link from "../link-no-prefetch";
import Modal from "../modal";
import SeparatedList from "../separated-list";
import SortableGrid from "../sortable-grid";
import Status from "../status";
// local
import { FileModalTitle } from "./file-modal-title";
import { type FileSetMetadata } from "./types";
// root
import { FileObject } from "../../globals";

/**
 * Defines the columns for the file table in the file set modal.
 */
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
    id: "input_file_for",
    title: "Input File For",
    display: ({ source, meta }) => {
      const { nativeFiles } = meta;
      const inputFileFor = source.input_file_for;
      if (inputFileFor.length > 0) {
        // Find the child files that are in the list of native file paths.
        const childFiles = inputFileFor
          .map((inputFileId) =>
            nativeFiles.find((file) => file["@id"] === inputFileId)
          )
          .filter((file) => file);
        if (childFiles.length > 0) {
          return (
            <SeparatedList isCollapsible>
              {childFiles.map((file) => (
                <Link
                  key={file["@id"]}
                  href={file["@id"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.accession}
                </Link>
              ))}
            </SeparatedList>
          );
        }
      }
      return null;
    },
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => <Status status={source.status} />,
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display a modal with detailed information about a file set when the user clicks on a node in the
 * graph.
 * @param node File-set node that the user clicked on
 * @param onClose Callback to close the modal
 */
export function FileSetModal({
  node,
  nativeFiles,
  onClose,
}: {
  node: Node<FileSetMetadata>;
  nativeFiles: FileObject[];
  onClose: () => void;
}) {
  const { fileSet, externalFiles, downstreamFile } =
    node.data as FileSetMetadata;
  const reportLink = `/multireport/?type=File&file_set.@id=${fileSet["@id"]}&input_file_for=${downstreamFile["@id"]}`;

  // Collect all sample summaries and display them as a collapsible list.
  const sampleSummaries =
    fileSet.samples?.length > 0
      ? fileSet.samples.map((sample) => sample.summary)
      : [];
  const uniqueSampleSummaries = [...new Set(sampleSummaries)];

  return (
    <Modal isOpen={true} onClose={onClose} testid="file-set-modal">
      <Modal.Header onClose={onClose}>
        <FileModalTitle item={fileSet}>
          <Link href={fileSet["@id"]} target="_blank" rel="noopener noreferrer">
            {fileSet.accession}
          </Link>
        </FileModalTitle>
      </Modal.Header>
      <DataPanel className="border-none">
        <DataArea>
          {fileSet.file_set_type && (
            <>
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValue>{fileSet.file_set_type}</DataItemValue>
            </>
          )}
          {fileSet.summary && (
            <>
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{fileSet.summary}</DataItemValue>
            </>
          )}
          {uniqueSampleSummaries.length > 0 && (
            <>
              <DataItemLabel>Sample Summaries</DataItemLabel>
              <DataItemList isCollapsible>{uniqueSampleSummaries}</DataItemList>
            </>
          )}
          {fileSet.aliases?.length > 0 && (
            <>
              <DataItemLabel>Aliases</DataItemLabel>
              <DataItemValue>
                <AliasList aliases={fileSet.aliases} />
              </DataItemValue>
            </>
          )}
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={fileSet.status} />
          </DataItemValue>
        </DataArea>
        <div className="mt-4">
          <div className="mb-1 flex justify-end">
            <DataAreaTitleLink
              href={reportLink}
              label="Files that something derives from"
              isExternal
            >
              <TableCellsIcon className="h-4 w-4" />
            </DataAreaTitleLink>
          </div>
          <SortableGrid
            data={externalFiles}
            columns={filesColumns}
            keyProp="@id"
            meta={{ nativeFiles }}
            pager={{} as any}
          />
        </div>
      </DataPanel>
    </Modal>
  );
}
