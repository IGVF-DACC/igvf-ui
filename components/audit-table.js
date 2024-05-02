// node_modules
import PropTypes from "prop-types";
// components
import { auditMap } from "./audit";
import SortableGrid from "./sortable-grid";

const auditColumns = [
  {
    id: "audit_level",
    title: "Severity Level",
    display: ({ source }) => {
      const auditLevel = source.audit_level;
      const mapping = auditMap[auditLevel];
      return (
        <div className="flex items-center justify-center gap-1">
          <mapping.Icon className={`h-4 w-4 ${mapping.color}`} />
          <div>{mapping.humanReadable}</div>
        </div>
      );
    },
  },
  {
    id: "audit_category",
    title: "Category",
    display: ({ source }) => {
      return <div className="flex items-center">{source.audit_category}</div>;
    },
    isSortable: false,
  },
  {
    id: "audit_description",
    title: "Description",
    display: ({ source }) => source.audit_description,
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given audits.
 */
export default function AuditTable({ data }) {
  return <SortableGrid data={data} columns={auditColumns} isTotalCountHidden />;
}

AuditTable.propTypes = {
  // Audits to display
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
