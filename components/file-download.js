// node_modules
import { ArrowDownOnSquareIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// lib
import { API_URL } from "../lib/constants";

/**
 * Display a file-download link and download icon. Only files with an `upload_status` of
 * `validated` show a download link.
 */
export function FileDownload({ file, className = "h-4 w-4" }) {
  const fileName = file.href.substr(file.href.lastIndexOf("/") + 1);

  return (
    <>
      {file.upload_status === "validated" && (
        <a
          aria-label={`Download file ${file.accession}`}
          href={`${API_URL}${file.href}`}
          download={fileName}
          data-bypass="true"
        >
          <ArrowDownOnSquareIcon className={className} />
        </a>
      )}
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
