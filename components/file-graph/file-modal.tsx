// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
// components
import AliasList from "../alias-list";
import {
  DataPanel,
  DataArea,
  DataItemLabel,
  DataItemValue,
} from "../data-area";
import { FileDownload } from "../file-download";
import { ButtonLink } from "../form-elements";
import { HostedFilePreview } from "../hosted-file-preview";
import Modal from "../modal";
import Status from "../status";
// local
import { FileModalTitle } from "./file-modal-title";
import { type FileNodeData } from "./types";
// lib
import { dataSize, truthyOrZero } from "../../lib/general";
// root
import { DatabaseObject } from "../../globals.d";

/**
 * Display a modal with detailed information about a file when the user clicks on a node in the
 * graph.
 * @param node Node that the user clicked on
 * @param onClose Callback to close the modal
 */
export function FileModal({
  node,
  onClose,
}: {
  node: FileNodeData;
  onClose: () => void;
}) {
  const { file } = node;
  const derivedFromReportLink = `/multireport/?type=File&input_file_for=${file["@id"]}`;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <FileModalTitle item={file}>
          <div className="flex items-center gap-1">
            <Link href={file["@id"]} target="_blank" rel="noopener noreferrer">
              {file.accession}
            </Link>
            <FileDownload file={file} />
            <HostedFilePreview file={file} buttonSize="sm" />
          </div>
        </FileModalTitle>
      </Modal.Header>
      <DataPanel className="border-none">
        <DataArea>
          {file.aliases?.length > 0 && (
            <>
              <DataItemLabel>Aliases</DataItemLabel>
              <DataItemValue>
                <AliasList aliases={file.aliases} />
              </DataItemValue>
            </>
          )}
          <DataItemLabel>Content Type</DataItemLabel>
          <DataItemValue>{file.content_type}</DataItemValue>
          <DataItemLabel>File Format</DataItemLabel>
          <DataItemValue>{file.file_format}</DataItemValue>
          {truthyOrZero(file.file_size) && (
            <>
              <DataItemLabel>File Size</DataItemLabel>
              <DataItemValue>{dataSize(file.file_size)}</DataItemValue>
            </>
          )}
          <DataItemLabel>Summary</DataItemLabel>
          <DataItemValue>{file.summary}</DataItemValue>
          {file.lab && (
            <>
              <DataItemLabel>Lab</DataItemLabel>
              <DataItemValue>
                <Link
                  href={file.lab["@id"]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {(file.lab as DatabaseObject).title}
                </Link>
              </DataItemValue>
            </>
          )}
          <DataItemLabel>Statuses</DataItemLabel>
          <DataItemValue className="flex items-center gap-1">
            <Status status={file.status} />
            <Status status={file.upload_status} />
          </DataItemValue>
          {file.derived_from?.length > 0 && (
            <>
              <DataItemLabel>
                Report of Files This File Derives From
              </DataItemLabel>
              <DataItemValue>
                <ButtonLink
                  href={derivedFromReportLink}
                  size="sm"
                  isInline
                  isExternal
                >
                  <TableCellsIcon className="h-4 w-4" />
                </ButtonLink>
              </DataItemValue>
            </>
          )}
        </DataArea>
      </DataPanel>
    </Modal>
  );
}
