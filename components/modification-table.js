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

const modificationsColumns = [
  {
    id: "modality",
    title: "Modality",
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
 * Display a sortable table of the given modifications.
 */
export default function ModificationsTable({ modifications }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={modifications.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid
            data={modifications}
            columns={modificationsColumns}
            keyProp="@id"
          />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

ModificationsTable.propTypes = {
  // Modifications to display
  modifications: PropTypes.arrayOf(PropTypes.object).isRequired,
};
