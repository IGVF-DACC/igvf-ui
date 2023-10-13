// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";
import Status from "./status";

const fileSetColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <Link href={source["@id"]}>{source.accession}</Link>
    ),
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => (source.aliases ? source.aliases.join(", ") : ""),
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title || null,
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
 * Display a sortable table of the given file sets.
 */
export default function FileSetTable({ fileSets }) {
  return (
    <DataGridContainer>
      <SortableGrid data={fileSets} columns={fileSetColumns} keyProp="@id" />
    </DataGridContainer>
  );
}

FileSetTable.propTypes = {
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
