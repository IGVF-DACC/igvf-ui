// node_modules
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
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
export default function TreatmentTable({ treatments, title = "Treatments" }) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
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
  // Optional title to display if not "Treatments"
  title: PropTypes.string,
};
