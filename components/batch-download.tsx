// node_modules
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
// components
import CopyButton from "./copy-button";
import { Button } from "./form-elements";
import Modal from "./modal";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import BaseController from "../lib/batch-download/base-controller";

/**
 * Display the default content for the batch-download modal. You can replace this completely by
 * providing your own content component as a child of the `<BatchDownloadActuator>` component. You
 * can add to this default content by importing it and using it in your own content component.
 *
 * This takes a `children` prop that can contain additional content to render after the default
 * content. `<BatchDownloadModal>` doesn't pass any children, but your custom modal content can if
 * you want to use the default content and add to the end of it.
 *
 * <BatchDownloadModal props>
 *   <BatchDownloadModalContent>
 *     <p>Additional content here</p>
 *   </BatchDownloadModalContent>
 * </BatchDownloadModal>
 */
export function BatchDownloadModalContent({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="prose dark:prose-invert">
      <p>
        Click the &ldquo;Download&rdquo; button below to download a file named
        &ldquo;file_metadata.tsv&rdquo; that contains the metadata for all
        selected files. With the current directory containing this file, use the
        following command line to download all files listed in the metadata
        file:
      </p>
      <div className="mt-2 flex gap-1">
        <code className="py-0">
          tail -n +2{" "}
          <i>
            <b>file_metadata.tsv</b>
          </i>{" "}
          | cut -f2 | xargs -L 1 curl -O -J -L
        </code>
        <CopyButton.Icon
          target="tail -n +2 file_metadata.tsv | cut -f2 | xargs -L 1 curl -O -J -L"
          label="Copy this command line to the clipboard"
          size="sm"
        >
          {(isCopied) =>
            isCopied ? <CheckIcon /> : <ClipboardDocumentCheckIcon />
          }
        </CopyButton.Icon>
      </div>
      <p>
        If necessary, replace{" "}
        <i>
          <b>file_metadata.tsv</b>
        </i>{" "}
        with the actual name of the downloaded file.
      </p>
      {children}
    </div>
  );
}

/**
 * Displays the batch-download modal, making it visible or not as requested.
 *
 * @param isOpen - True when the modal is open
 * @param isDownloadDisabled - True when the user clicks the DL button, immediately disabling it
 * @param onDownload - Called to initiate the download
 * @param onClose - Called to close the modal
 * @param children - Optional children to render in the modal body
 */
function BatchDownloadModal({
  isOpen,
  isDownloadDisabled,
  onDownload,
  onClose,
  children,
}: {
  isOpen: boolean;
  isDownloadDisabled: boolean;
  onDownload: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} testid="batch-download-modal">
      <Modal.Header onClose={onClose}>
        <h2>Download Files</h2>
      </Modal.Header>
      <Modal.Body>{children || <BatchDownloadModalContent />}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} type="secondary">
          Close
        </Button>
        <Button onClick={onDownload} isDisabled={isDownloadDisabled}>
          <div className="flex items-center gap-1">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download
          </div>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Displays the batch-download button and controls the batch-download modal. The button opens the
 * modal, and the modal initiates the download of a manifest file containing a list of files to
 * download and instructions on how to download them.
 */
export function BatchDownloadActuator({
  controller,
  label,
  size = "md",
  onDownloadActuated,
  onDownloadModalClosed,
  children,
}: {
  controller: BaseController;
  label: string;
  size?: "sm" | "md" | "lg";
  onDownloadActuated?: () => void;
  onDownloadModalClosed?: () => void;
  children?: React.ReactNode;
}) {
  const tooltipAttr = useTooltip("download-actuator-tips");

  // True when the modal is open
  const [isModalOpen, setIsModalOpen] = useState(false);
  // True when the Download button in the modal has been clicked and should be disabled
  const [isDownloadDisabled, setIsDownloadDisabled] = useState(false);

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div>
          <Button
            id="batch-download-actuator"
            onClick={() => setIsModalOpen(true)}
            size={size}
            label={label}
            hasIconOnly={true}
            className="h-full"
          >
            <ArrowDownTrayIcon className="h-2 w-2" />
          </Button>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{label}</Tooltip>
      <BatchDownloadModal
        isOpen={isModalOpen}
        isDownloadDisabled={isDownloadDisabled}
        onDownload={() => {
          setIsDownloadDisabled(true);
          if (onDownloadActuated) {
            onDownloadActuated();
          }
          controller.initiateDownload();
        }}
        onClose={() => {
          setIsModalOpen(false);
          setIsDownloadDisabled(false);
          if (onDownloadModalClosed) {
            onDownloadModalClosed();
          }
        }}
      >
        {children}
      </BatchDownloadModal>
    </>
  );
}
