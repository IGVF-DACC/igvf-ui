// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataAreaTitle } from "./data-area";
import { DataGridContainer } from "./data-grid";
import { FileAccessionAndDownload } from "./file-download";
import { ButtonLink } from "./form-elements";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import TableCount from "./table-count";

/**
 * Columns for the two file tables; both those with `illumina_read_type` (meta.hasReadType is true)
 * and those without.
 */
const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => <FileAccessionAndDownload file={source} />,
  },
  {
    id: "file_format",
    title: "File Format",
  },
  {
    id: "content_type",
    title: "Content Type",
  },
  {
    id: "illumina_read_type",
    title: "Illumina Read Type",
    hide: (data, columns, meta) => !meta.hasReadType,
  },
  {
    id: "sequencing_run",
    title: "Sequencing Run",
  },
  {
    id: "seqspec",
    title: "Associated seqspec File",
    display: ({ source }, meta) => {
      const matchingSeqspec = meta.seqspecFiles.find(
        (seqspec) => seqspec["@id"] === source.seqspec
      );
      return (
        matchingSeqspec && (
          <Link href={matchingSeqspec.href}>{matchingSeqspec.accession}</Link>
        )
      );
    },
    hide: (data, columns, meta) => meta.isSeqspecHidden,
  },
  {
    id: "sequencing_platform",
    title: "Sequencing Platform",
    display: (cell, meta) => {
      const matchingPlatform = meta.sequencingPlatforms.find(
        (platform) => platform["@id"] === cell.source.sequencing_platform
      );
      return matchingPlatform?.term_name || null;
    },
  },
  {
    id: "flowcell_id",
    title: "Flowcell ID",
  },
  {
    id: "lane",
    title: "Lane",
  },
  {
    id: "index",
    title: "Index",
  },
  {
    id: "file_size",
    title: "File Size",
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
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
 * Display a sortable table of the given files, specifically for FileSet pages that include
 * sequencing files.
 */
export default function SequencingFileTable({
  files,
  title = "Files",
  itemPath = "",
  itemPathProp = "file_set",
  isIlluminaReadType = undefined,
  sequencingPlatforms,
  seqspecFiles = [],
  hasReadType = false,
  isSeqspecHidden = false,
}) {
  const gridRef = useRef(null);

  // True or false isIlluminaReadType adds a positive or negative `illumina_read_type` selector to
  // the report link. Undefined generates no `illumina_read_type` selector in the file query string.
  let illuminaSelector = "";
  if (isIlluminaReadType === true) {
    illuminaSelector = "&illumina_read_type=*";
  } else if (isIlluminaReadType === false) {
    illuminaSelector = "&illumina_read_type!=*";
  }

  const reportLink = itemPath
    ? `/multireport/?type=File&${itemPathProp}=${encodeURIComponent(
        itemPath
      )}${illuminaSelector}`
    : "";

  return (
    <>
      <DataAreaTitle>
        <div className="flex items-end justify-between">
          {title}
          {reportLink && (
            <ButtonLink
              href={reportLink}
              size="sm"
              label="Report of files that have this item as their file set"
            >
              <TableCellsIcon className="h-4 w-4" />
            </ButtonLink>
          )}
        </div>
      </DataAreaTitle>
      <TableCount count={files.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid
            data={files}
            columns={filesColumns}
            meta={{
              seqspecFiles,
              sequencingPlatforms,
              hasReadType,
              isSeqspecHidden,
            }}
            keyProp="@id"
          />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

SequencingFileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table
  title: PropTypes.string,
  // Current page's path
  itemPath: PropTypes.string,
  // Property of the files that links back to the current page
  itemPathProp: PropTypes.string,
  // True to show only files with illumina_read_type, false to show only files without
  isIlluminaReadType: PropTypes.bool,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object),
  // True if files have illumina_read_type
  hasReadType: PropTypes.bool,
  // True to hide the seqspec column
  isSeqspecHidden: PropTypes.bool,
};
