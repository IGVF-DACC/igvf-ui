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
        data={treatments}
        columns={treatmentColumns}
        pager={{}}
        keyProp="@id"
      />
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
};
