// node_modules
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataAreaTitle } from "./data-area";
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import TableCount from "./table-count";

const columns = [
  {
    id: "resource_identifier",
    title: "Identifier",
    display: ({ source }) => (
      <>
        {source.resource_url ? (
          <a href={source.resource_url} target="_blank" rel="noreferrer">
            {source.resource_identifier}
          </a>
        ) : (
          <>{source.resource_identifier}</>
        )}
      </>
    ),
  },
  {
    id: "resource_name",
    title: "Name",
    isSortable: false,
  },
];

/**
 * Display a table of external resources.
 */
export default function ExternalResources({ resources = [] }) {
  const gridRef = useRef(null);

  if (resources.length > 0) {
    return (
      <>
        <DataAreaTitle>Resources</DataAreaTitle>
        <TableCount count={resources.length} />
        <ScrollIndicators gridRef={gridRef}>
          <DataGridContainer ref={gridRef}>
            <SortableGrid data={resources} columns={columns} />
          </DataGridContainer>
        </ScrollIndicators>
      </>
    );
  }
  return null;
}

ExternalResources.propTypes = {
  // List of external resources to display
  resources: PropTypes.arrayOf(PropTypes.object),
};
