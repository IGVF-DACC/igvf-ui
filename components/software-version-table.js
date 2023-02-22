// node_modules
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import ItemLink from "./item-link";
import SortableGrid from "./sortable-grid";
import Link from "next/link";

/**
 * Columns displayed in the software version table.
 */
const columns = [
  {
    id: "@id",
    title: "Page",
    isSortable: false,
    display: ({ source }) => {
      return (
        <ItemLink
          href={source["@id"]}
          label={`View page for document ${source.description}`}
        />
      );
    },
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "version",
    title: "Version",
  },
  {
    id: "downloaded_url",
    title: "Download",
    display: ({ source }) => {
      return (
        <Link
          href={source.downloaded_url}
          key={source.downloaded_url}
          target="_blank"
        >
          {source.downloaded_url}
        </Link>
      );
    },
  },
];

/**
 * Display the given software versions in a table,
 */
export default function SoftwareVersionTable({ versions }) {
  return (
    <DataGridContainer>
      <SortableGrid data={versions} columns={columns} />
    </DataGridContainer>
  );
}

SoftwareVersionTable.propTypes = {
  // versions to display in the table
  versions: PropTypes.array.isRequired,
};
