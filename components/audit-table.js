// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// components
import { auditMap } from "./audit";
import SortableGrid from "./sortable-grid";
// lib
import { auditLevelOrder } from "../lib/audit";

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
    isSortable: false,
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
 * Display a sorted table of the given audits.
 */
export default function AuditTable({ data }) {
  // Sort audits with `audit_level` as the primary key and `audit_category` as the secondary key.
  const sortedData = _.sortBy(data, [
    (audit) => auditLevelOrder.indexOf(audit.audit_level),
    (audit) => audit.audit_category.toLowerCase(),
  ]);

  return (
    <SortableGrid
      data={sortedData}
      columns={auditColumns}
      initialSort={{ isSortingSuppressed: true }}
      isTotalCountHidden
      isPagerHidden
    />
  );
}

AuditTable.propTypes = {
  // Audits to display
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
