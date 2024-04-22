// node_modules
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";

const modificationsColumns = [
  {
    id: "summary",
    title: "Summary",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.summary}</LinkedIdAndStatus>
    ),
  },
  {
    id: "modality",
    title: "Modality",
  },
];

/**
 * Display a sortable table of the given modifications.
 */
export default function ModificationTable({
  modifications,
  title = "Modifications",
}) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid
        data={modifications}
        columns={modificationsColumns}
        keyProp="@id"
      />
    </>
  );
}

ModificationTable.propTypes = {
  // Modifications to display
  modifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table if not "Modifications"
  title: PropTypes.string,
};
