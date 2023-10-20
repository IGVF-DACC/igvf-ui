// node_modules
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

const auditColumns = [
  {
    id: "audit_level",
    title: "Audit Level",
    display: ({ source }) =>
      source.audit_levels ? source.audit_levels.join(", ") : "",
  },
  {
    id: "audit_category",
    title: "Audit Category",
    display: ({ source }) => `${source.audit_category}`,
  },
  {
    id: "audit_detail",
    title: "Audit Detail",
    display: ({ source }) => `${source.audit_detail}`,
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given audits.
 */
export default function AuditDynamicTable({ arrayVersion }) {
  return (
    <DataGridContainer>
      <SortableGrid data={arrayVersion} columns={auditColumns} />
    </DataGridContainer>
  );
}

AuditDynamicTable.propTypes = {
  // Audits to display
  arrayVersion: PropTypes.arrayOf(PropTypes.object).isRequired,
};
