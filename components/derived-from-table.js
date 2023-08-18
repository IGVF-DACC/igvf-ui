// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

/**
 * Columns for derived from files.
 */
const columns = [
  {
    id: "@id",
    title: "Accession",
    isSortable: false,
    display: (source) => {
      const accession = source.source.accession;
      return <Link href={source.source["@id"]}>{accession}</Link>;
    },
  },
  {
    id: "file_set",
    title: "File Set",
    display: (cell, meta) => {
      const fileSet = meta.derivedFromFileSets.find(
        (fileSet) => fileSet["@id"] === cell.source.file_set
      );
      return fileSet && <Link href={fileSet["@id"]}>{fileSet.accession}</Link>;
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
    id: "lab.title",
    title: "Lab",
    display: ({ source }) => `${source.lab.title}`,
  },
  {
    id: "file_size",
    title: "File Size",
  },
  {
    id: "status",
    title: "Status",
  },
];

/**
 * Display the given files in a table, useful for pages displaying files derived from other files.
 */
export default function DerivedFromTable({ derivedFrom, derivedFromFileSets }) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={derivedFrom}
        columns={columns}
        meta={{ derivedFromFileSets }}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

DerivedFromTable.propTypes = {
  // Files to display in the table
  derivedFrom: PropTypes.array.isRequired,
  // File sets of the files
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
};
