// node_modules
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataGridContainer } from "./data-grid";
import ItemLink from "./item-link";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import TableCount from "./table-count";

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
export default function SoftwareVersionTable({ versions }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={versions.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid data={versions} columns={columns} />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

SoftwareVersionTable.propTypes = {
  // versions to display in the table
  versions: PropTypes.array.isRequired,
};
