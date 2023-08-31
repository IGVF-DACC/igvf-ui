// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";
import Status from "./status";

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
  return (
    <DataGridContainer>
      <SortableGrid
        data={modifications}
        columns={modificationsColumns}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

ModificationsTable.propTypes = {
  // Modifications to display
  modifications: PropTypes.arrayOf(PropTypes.object).isRequired,
};
