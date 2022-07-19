// node_modules
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

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
const ExternalResources = ({ resources = [] }) => {
  if (resources.length > 0) {
    return (
      <>
        <DataAreaTitle>Resources</DataAreaTitle>
        <DataGridContainer>
          <SortableGrid data={resources} columns={columns} />
        </DataGridContainer>
      </>
    );
  }
  return null;
};

ExternalResources.propTypes = {
  // List of external resources to display
  resources: PropTypes.arrayOf(PropTypes.object),
};

export default ExternalResources;
