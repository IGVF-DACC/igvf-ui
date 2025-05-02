// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import { SeqspecDocumentLink } from "./seqspec-document";
import SortableGrid from "./sortable-grid";
import Status from "./status";
// lib
import { dataSize, truthyOrZero } from "../lib/general";

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
    id: "read_names",
    title: "Read Names",
    display: ({ source }) =>
      source.read_names ? source.read_names?.join(", ") : "",
    isSortable: false,
  },
  {
    id: "seqspecs",
    title: "Associated seqspec Files",
    display: ({ source, meta }) => {
      if (source.seqspecs?.length > 0) {
        const sourceSeqspecPaths =
          typeof source.seqspecs[0] === "string"
            ? source.seqspecs
            : source.seqspecs.map((seqspec) => seqspec["@id"]);
        let matchingSeqspecs = meta.seqspecFiles.filter((seqspec) =>
          sourceSeqspecPaths.includes(seqspec["@id"])
        );
        if (matchingSeqspecs.length > 0) {
          matchingSeqspecs = _.sortBy(matchingSeqspecs, "accession");
          return (
            <div>
              {matchingSeqspecs.map((matchingSeqspec) => (
                <div
                  className="my-1.5 first:mt-0 last:mb-0"
                  key={matchingSeqspec["@id"]}
                >
                  <FileAccessionAndDownload file={matchingSeqspec} />
                </div>
              ))}
            </div>
          );
        }
      }
      return null;
    },
    hide: (data, columns, meta) => meta.isSeqspecHidden,
  },
  {
    id: "seqspec_document",
    title: "Sequence Specification Document",
    display: ({ source, meta }) => {
      const matchingSeqspecDocument = meta.seqspecDocuments.find(
        (seqspecDocument) => source.seqspec_document === seqspecDocument["@id"]
      );
      if (matchingSeqspecDocument) {
        return (
          <SeqspecDocumentLink seqspecDocument={matchingSeqspecDocument} />
        );
      }
    },
    sorter: (item, meta) => {
      const matchingSeqspecDocument = meta.seqspecDocuments.find(
        (seqspecDocument) => item.seqspec_document === seqspecDocument["@id"]
      );
      return matchingSeqspecDocument
        ? matchingSeqspecDocument.attachment.download
        : "";
    },
    hide: (data, columns, meta) => meta.isSeqspecHidden,
  },
  {
    id: "sequencing_platform",
    title: "Sequencing Platform",
    display: ({ source }) => {
      return (
        <Link href={source.sequencing_platform["@id"]}>
          {source.sequencing_platform.term_name}
        </Link>
      );
    },
    sorter: (item) => item.sequencing_platform.term_name.toLowerCase(),
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
    display: ({ source }) =>
      truthyOrZero(source.file_size) ? dataSize(source.file_size) : "",
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
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
  itemPathProp = "file_set.@id",
  isIlluminaReadType = undefined,
  seqspecFiles = [],
  seqspecDocuments = [],
  hasReadType = false,
  isSeqspecHidden = false,
  panelId = "sequencing-files",
}) {
  // True or false isIlluminaReadType adds a positive or negative `illumina_read_type` selector to
  // the report link. Undefined generates no `illumina_read_type` selector in the file query string.
  let illuminaSelector = "";
  if (isIlluminaReadType === true) {
    illuminaSelector = "&illumina_read_type=*";
  } else if (isIlluminaReadType === false) {
    illuminaSelector = "&illumina_read_type!=*";
  }

  const reportLink = itemPath
    ? `/multireport/?type=SequenceFile&${itemPathProp}=${encodeURIComponent(
        itemPath
      )}${illuminaSelector}`
    : "";

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && (
          <DataAreaTitleLink
            href={reportLink}
            label="Report of files that have this item as their file set"
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={files}
          columns={filesColumns}
          pager={{}}
          meta={{
            seqspecFiles,
            seqspecDocuments,
            hasReadType,
            isSeqspecHidden,
          }}
          keyProp="@id"
        />
      </div>
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
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object),
  // seqspec documents associated with `files`
  seqspecDocuments: PropTypes.arrayOf(PropTypes.object),
  // True if files have illumina_read_type
  hasReadType: PropTypes.bool,
  // True to hide the seqspec column
  isSeqspecHidden: PropTypes.bool,
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
