// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
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
  reportLink = null,
  reportLabel = null,
  title = "Modifications",
}) {
  return (
    <>
      <DataAreaTitle>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
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
  // Link to the report; use with `reportLabel`
  reportLink: PropTypes.string,
  // Label for the report link; use with `reportLink`
  reportLabel: PropTypes.string,
  // Title for the table if not "Modifications"
  title: PropTypes.string,
};
