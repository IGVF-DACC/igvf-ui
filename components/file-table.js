// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";
import Status from "./status";

const filesColumns = [
  {
    id: "file_id",
    title: "Accession",
    display: ({ source }) => {
      return <Link href={source["@id"]}>{source.accession}</Link>;
    },
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
