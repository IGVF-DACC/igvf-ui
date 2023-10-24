// node_modules
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import { auditMap } from "./audit";
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

const auditColumns = [
  {
    id: "audit_level",
    title: "Audit Level",
    display: ({ source }) => {
      const filteredSource = source.audit_levels.filter(
        (audit) => audit !== "INTERNAL_ACTION"
      );
      return (
        <div>
          {filteredSource.map((level) => {
            const mapping = auditMap[level];
            return (
              <Fragment key={level}>
                <div className="flex items-center justify-start gap-1">
                  <mapping.Icon className={`h-4 w-4 ${mapping.color}`} />
                  <div>{mapping.humanReadable}</div>
                </div>
              </Fragment>
            );
          })}
        </div>
      );
    },
    isSortable: false,
  },
  {
    id: "audit_category",
    title: "Audit Category",
    display: ({ source }) => source.audit_category,
    isSortable: false,
  },
  {
    id: "audit_detail",
    title: "Audit Detail",
    display: ({ source }) => source.audit_detail,
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given audits.
 */
export default function AuditTable({ data }) {
  return (
    <DataGridContainer>
      <SortableGrid data={data} columns={auditColumns} />
    </DataGridContainer>
  );
}

AuditTable.propTypes = {
  // Audits to display
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
