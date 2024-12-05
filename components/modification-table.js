// node_modules
import PropTypes from "prop-types";
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
  panelId = "modifications",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>{title}</DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={modifications}
          columns={modificationsColumns}
          keyProp="@id"
        />
      </div>
    </>
  );
}

ModificationTable.propTypes = {
  // Modifications to display
  modifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table if not "Modifications"
  title: PropTypes.string,
  // Unique ID for the table for the section directory
  panelId: PropTypes.string,
};
