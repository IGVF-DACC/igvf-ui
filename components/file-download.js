// node_modules
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import LinkedIdAndStatus from "./linked-id-and-status";
// lib
import { API_URL } from "../lib/constants";
import { ButtonLink } from "./form-elements";

const FILE_NOT_FOUND = "file not found";
const PENDING = "pending";

/**
 * Display a file-download link and download icon. Files without an `upload_status` of `file not
 * found` or `pending` have a disabled download link.
 */
export function FileDownload({ file, className = "" }) {
  const isDownloadDisabled = [FILE_NOT_FOUND, PENDING].includes(
    file.upload_status
  );
  return (
    <ButtonLink
      label={`Download file ${file.accession}`}
      href={`${API_URL}${file.href}`}
      type="secondary"
      size="sm"
      isDisabled={isDownloadDisabled}
      hasIconOnly
      className={className}
    >
      <ArrowDownTrayIcon />
    </ButtonLink>
  );
}

FileDownload.propTypes = {
  // File to download
  file: PropTypes.object.isRequired,
  // Tailwind CSS classes for the download icon
  className: PropTypes.string,
};

/**
 * File download link for the file object page headers.
 */
export function FileHeaderDownload({ file }) {
  return (
    <div
      className="flex grow items-center px-1"
      data-testid="file-header-download"
    >
      <FileDownload file={file} />
    </div>
  );
}

FileHeaderDownload.propTypes = {
  // File to download
  file: PropTypes.object.isRequired,
};

/**
 * Display a file's accession and download link on one row.
 */
export function FileAccessionAndDownload({ file }) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <LinkedIdAndStatus item={file}>{file.accession}</LinkedIdAndStatus>
        <FileDownload file={file} />
      </div>
    </div>
  );
}

FileAccessionAndDownload.propTypes = {
  // File to link to and download
  file: PropTypes.object.isRequired,
};
