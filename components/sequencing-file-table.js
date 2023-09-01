// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import { FileAccessionAndDownload } from "./file-download";
import SortableGrid from "./sortable-grid";
import Status from "./status";

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
  sequencingPlatforms,
  seqspecFiles = [],
  hasReadType = false,
}) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={files}
        columns={filesColumns}
        meta={{ seqspecFiles, sequencingPlatforms, hasReadType }}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

SequencingFileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object),
  // True if files have illumina_read_type
  hasReadType: PropTypes.bool,
};
