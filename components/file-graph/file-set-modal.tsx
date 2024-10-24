// node_modules
import Link from "next/link";
// components
import AliasList from "../alias-list";
import {
  DataPanel,
  DataArea,
  DataItemLabel,
  DataItemValue,
} from "../data-area";
import { FileAccessionAndDownload } from "../file-download";
import Modal from "../modal";
import SortableGrid from "../sortable-grid";
import Status from "../status";
// local
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
      <FileAccessionAndDownload file={source} isTargetBlank />
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
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * File table for a file set modal.
 * @param files List of files to display in the table
 */
function FileSetFileTable({ files }: { files: FileObject[] }) {
  return (
    <SortableGrid
      data={files}
      columns={filesColumns}
      keyProp="@id"
      pager={{} as any}
    />
  );
}

/**
 * Display a modal with detailed information about a file set when the user clicks on a node in the
 * graph.
 * @param node File-set node that the user clicked on
 * @param onClose Callback to close the modal
 */
export function FileSetModal({
  node,
  onClose,
}: {
  node: FileSetNodeData;
  onClose: () => void;
}) {
  const { fileSet } = node;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <div className="flex gap-1">
          <Link href={fileSet["@id"]} target="_blank" rel="noopener noreferrer">
            {fileSet.accession}
          </Link>
        </div>
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
          {fileSet.summary && (
            <>
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{fileSet.summary}</DataItemValue>
            </>
          )}
        </DataArea>
        <div className="mt-4">
          <FileSetFileTable files={node.files} />
        </div>
      </DataPanel>
    </Modal>
  );
}
