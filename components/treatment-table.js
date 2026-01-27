// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";

const treatmentColumns = [
  {
    id: "treatment_term_name",
    title: "Term Name",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>
          {source.treatment_term_name}
        </LinkedIdAndStatus>
      );
    },
    sorter: (item) => item.treatment_term_name.toLowerCase(),
  },
  {
    id: "purpose",
    title: "Purpose",
  },
  {
    id: "treatment_type",
    title: "Type",
  },
  {
    id: "summary",
    title: "Summary",
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given treatments.
 */
export default function TreatmentTable({
  treatments,
  reportLink = null,
  reportLabel = null,
  title = "Treatments",
  isDeletedVisible = false,
  panelId = "treatments",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink
            href={reportLink}
            label={reportLabel}
            isDeletedVisible={isDeletedVisible}
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={treatments}
          columns={treatmentColumns}
          keyProp="@id"
        />
      </div>
    </>
  );
}

TreatmentTable.propTypes = {
  // Treatments to display
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to report of treatments; use with `reportLabel`
  reportLink: PropTypes.string,
  // Label for report link; use with `reportLink`
  reportLabel: PropTypes.string,
  // Optional title to display if not "Treatments"
  title: PropTypes.string,
  // True to show deleted items in the linked report view
  isDeletedVisible: PropTypes.bool,
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
