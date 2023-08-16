// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

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
    display: (source) => {
      return (
        <Link href={source.source.file_set}>
          {source.source.file_set.slice(-15, -1)}
        </Link>
      );
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

export default function DerivedFromTable({ derivedFrom }) {
  return (
    <DataGridContainer>
      <SortableGrid data={derivedFrom} columns={columns} />
    </DataGridContainer>
  );
}

DerivedFromTable.propTypes = {
  // Files to display in the table
  derivedFrom: PropTypes.array.isRequired,
};
