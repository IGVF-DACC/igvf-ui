// node_modules
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// lib
import { API_URL } from "../lib/constants";
import { ButtonLink } from "./form-elements";

/**
 * Display a file-download link and download icon. Only files with an `upload_status` of
 * `validated` show a download link.
 */
export function FileDownload({
  file,
  className = "",
}) {

  return (
    <>
      <ButtonLink
        label={`Download file ${file.accession}`}
        href={`${API_URL}${file.href}`}
        type="secondary"
        size="sm"
        isDisabled={file.upload_status !== "validated"}
        hasIconOnly
        className={`${className}`}
      >
        <ArrowDownTrayIcon />
      </ButtonLink>
    </>
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
    <div className="flex grow items-center px-1">
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
        <Link href={file["@id"]}>{file.accession}</Link>
        <FileDownload file={file} />
      </div>
    </div>
  );
}

FileAccessionAndDownload.propTypes = {
  // File to link to and download
  file: PropTypes.object.isRequired,
};
