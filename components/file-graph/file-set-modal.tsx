// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
// components
import AliasList from "../alias-list";
import {
  DataPanel,
  DataArea,
  DataAreaTitleLink,
  DataItemLabel,
  DataItemValue,
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
import { type FileSetNodeData } from "./types";
// root
import type { FileObject } from "../../globals.d";

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
  node: FileSetNodeData;
  nativeFiles: FileObject[];
  onClose: () => void;
}) {
  const { fileSet } = node;
  const childFile = node.childFile;
  const reportLink = `/multireport/?type=File&file_set.@id=${fileSet["@id"]}&input_file_for=${childFile["@id"]}`;

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
          {fileSet.aliases?.length > 0 && (
            <>
              <DataItemLabel>Aliases</DataItemLabel>
              <DataItemValue>
                <AliasList aliases={fileSet.aliases} />
              </DataItemValue>
            </>
          )}
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
            data={node.files}
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
