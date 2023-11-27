// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import TableCount from "./table-count";

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
export default function TreatmentTable({ treatments }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={treatments.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid
            data={treatments}
            columns={treatmentColumns}
            keyProp="@id"
          />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

TreatmentTable.propTypes = {
  // Treatments to display
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
};
