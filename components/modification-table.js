// node_modules
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

const modificationsColumns = [
  {
    id: "modality",
    title: "Modality",
  },
  {
    id: "cas",
    title: "Cas",
  },
  {
    id: "Cas Species",
    title: "Cas Species",
  },
  {
    id: "fused_domain",
    title: "Fused Domain",
  },
  {
    id: "tagged_protein",
    title: "Tagged Protein",
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
