// node_modules
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

const auditColumns = [
  {
    id: "audit_level",
    title: "Audit Level",
    display: ({ audit }) =>
      audit.audit_levels ? audit.audit_levels.join(", ") : "",
  },
  {
    id: "audit_category",
    title: "Audit Category",
    display: ({ audit }) => `${audit.audit_category}`,
  },
  {
    id: "audit_detail",
    title: "Audit Detail",
    display: ({ audit }) => `${audit.audit_detail}`,
  },
];

/**
 * Display a sortable table of the given audits.
 */
export default function AuditDynamicTable({ arrayVersion }) {
  return (
    <DataGridContainer>
      <SortableGrid data={arrayVersion} columns={auditColumns} keyProp="@id" />
    </DataGridContainer>
  );
}

AuditDynamicTable.propTypes = {
  // Audits to display
  arrayVersion: PropTypes.arrayOf(PropTypes.object).isRequired,
};
