// node_modules
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import { FileAccessionAndDownload } from "./file-download";
import SortableGrid from "./sortable-grid";
import Status from "./status";

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
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
  },
  {
    id: "file_size",
    title: "File Size",
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => {
      return <Status status={source.status} />;
    },
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display a sortable table of the given files.
 */
export default function FileTable({ files }) {
  return (
    <DataGridContainer>
      <SortableGrid data={files} columns={filesColumns} keyProp="@id" />
    </DataGridContainer>
  );
}

FileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
};
