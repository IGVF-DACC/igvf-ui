// node_modules
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";
import { useContext } from "react";
// components
import { ExternallyHostedBadge } from "./common-pill-badges";
import { ButtonLink } from "./form-elements";
import LinkedIdAndStatus from "./linked-id-and-status";
import SessionContext from "./session-context";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { API_URL } from "../lib/constants";
import { checkFileDownloadable } from "../lib/files";
// root
import type { FileObject } from "../globals";

/**
 * Display a file-download link and download icon. Files without an `upload_status` of `file not
 * found` or `pending` have a disabled download link, as do files with controlled access and an
 * Anvil URL.
 * @param file - File to download
 * @param className - Additional classes to add to the button
 */
export function FileDownload({
  file,
  className = "",
}: {
  file: FileObject;
  className?: string;
}) {
  const { sessionProperties } = useContext(SessionContext);

  const tooltipAttr = useTooltip("file-download");

  if (file.externally_hosted) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div>
            <ButtonLink
              label="Open externally hosted file in a new page"
              href={file.external_host_url}
              type="secondary"
              size="sm"
              hasIconOnly
              className={className}
              isExternal
            >
              <ArrowTopRightOnSquareIcon data-testid="icon-externally-hosted" />
            </ButtonLink>
          </div>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>
          Open page for externally hosted file
        </Tooltip>
      </>
    );
  }

  const isFileDownloadable = checkFileDownloadable(
    file,
    sessionProperties?.user?.viewing_groups
  );

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div>
          <ButtonLink
            label={`Download file ${file.accession}`}
            href={`${API_URL}${file.href}`}
            type="secondary"
            size="sm"
            isDisabled={!isFileDownloadable}
            hasIconOnly
            className={className}
          >
            <ArrowDownTrayIcon />
          </ButtonLink>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        {isFileDownloadable
          ? `Download ${file.file_format} file`
          : "File not available for download"}
      </Tooltip>
    </>
  );
}

/**
 * File download link for the file object page headers.
 * @param file - File to download
 */
export function FileHeaderDownload({
  file,
  children,
}: {
  file: FileObject;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1" data-testid="file-header-download">
      <FileDownload file={file} />
      {children}
    </div>
  );
}

/**
 * Display a file's accession and download link on one row.
 * @param file - File to link to and download
 * @param isTargetBlank - Open the download link in a new tab
 */
export function FileAccessionAndDownload({
  file,
  isTargetBlank = false,
  isInline = false,
}: {
  file: FileObject;
  isTargetBlank?: boolean;
  isInline?: boolean;
}) {
  return (
    <>
      <div
        className={`${isInline ? "inline-flex" : "flex"} items-center gap-1`}
        data-testid="file-accession-and-download"
      >
        <LinkedIdAndStatus item={file} isTargetBlank={isTargetBlank}>
          {file.accession}
        </LinkedIdAndStatus>
        <FileDownload file={file} />
      </div>
      {file.externally_hosted && <ExternallyHostedBadge className="mt-1" />}
    </>
  );
}
