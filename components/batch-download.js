// node_modules
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import CopyButton from "./copy-button";
import { Button } from "./form-elements";
import Modal from "./modal";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";

/**
 * Example command line to download files listed in a manifest file.
 */
const commandLineExample = "xargs -L 1 curl -O -J -L < files.txt";

/**
 * Display the default content for the batch-download modal. You can replace this completely by
 * providing your own content component as a child of the BatchDownloadActuator component. You can
 * add to this default content by importing it and using it in your own content component.
 */
export function BatchDownloadModalContent() {
  return (
    <div className="prose dark:prose-invert">
      <p>
        Click the &ldquo;Download&rdquo; button below to download a manifest
        file named &ldquo;files.txt&rdquo; that contains a URL to a file
        containing all the experimental metadata, as well as links to download
        each of the relevant files.
      </p>
      <p>The manifest file can be copied to any server.</p>
      <p>
        With the current directory containing the downloaded manifest file, use
        the following command line to download all files listed in the manifest:
      </p>
      <div className="mt-2 flex gap-1">
        <code className="py-0">{commandLineExample}</code>
        <CopyButton.Icon
          target={commandLineExample}
          label="Copy this command line to the clipboard"
          size="sm"
        >
          {(isCopied) =>
            isCopied ? <CheckIcon /> : <ClipboardDocumentCheckIcon />
          }
        </CopyButton.Icon>
      </div>
    </div>
  );
}

/**
 * Displays the batch-download modal, making it visible or not as requested.
 */
function BatchDownloadModal({
  isOpen,
  isDownloadDisabled,
  onDownload,
  onClose,
  children,
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

BatchDownloadModal.propTypes = {
  // True when the modal is open
  isOpen: PropTypes.bool.isRequired,
  // True when the Download button in the modal has been clicked and should be disabled
  isDownloadDisabled: PropTypes.bool.isRequired,
  // Called to initiate the download
  onDownload: PropTypes.func.isRequired,
  // Called to close the modal
  onClose: PropTypes.func.isRequired,
};

/**
 * Displays the batch-download button and controls the batch-download modal. The button opens the
 * modal, and the modal initiates the download of a manifest file containing a list of files to
 * download and instructions on how to download them.
 */
export function BatchDownloadActuator({
  controller,
  label,
  size = "md",
  children,
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
        controller={controller}
        isOpen={isModalOpen}
        isDownloadDisabled={isDownloadDisabled}
        onDownload={() => {
          setIsDownloadDisabled(true);
          controller.initiateDownload();
        }}
        onClose={() => {
          setIsModalOpen(false);
          setIsDownloadDisabled(false);
        }}
      >
        {children}
      </BatchDownloadModal>
    </>
  );
}

BatchDownloadActuator.propTypes = {
  // Batch download controller from /lib/batch-download
  controller: PropTypes.object.isRequired,
  // Accessible Label for the download button, as well as the tooltip
  label: PropTypes.string.isRequired,
  // Size of the download button using /components/form-elements/Button sizes
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};
