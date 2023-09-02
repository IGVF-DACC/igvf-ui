// node_modules
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
  hasReadType = false,
}) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={files}
        columns={filesColumns}
        meta={{ sequencingPlatforms, hasReadType }}
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
  // True if files have illumina_read_type
  hasReadType: PropTypes.bool,
};
