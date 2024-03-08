// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import SortableGrid from "./sortable-grid";
import Status from "./status";

const treatmentColumns = [
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
    display: ({ source }) => {
      return <Link href={source["@id"]}>{source.summary}</Link>;
    },
    isSortable: false,
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => {
      return <Status status={source.status} />;
    },
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
