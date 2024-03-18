// node_modules
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import ItemLink from "./item-link";
import SortableGrid from "./sortable-grid";

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
          label={`View page for software version ${source.version}`}
        />
      );
    },
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
        <a href={source.downloaded_url} target="_blank" rel="noreferrer">
          {source.downloaded_url}
        </a>
      );
    },
  },
];

/**
 * Display the given software versions in a table,
 */
export default function SoftwareVersionTable({
  versions,
  title = "Software Versions",
}) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid data={versions} columns={columns} pager={{}} />;
    </>
  );
}

SoftwareVersionTable.propTypes = {
  // versions to display in the table
  versions: PropTypes.array.isRequired,
  // Title for the table if not "Software Versions"
  title: PropTypes.string,
};
