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
      // filter out the internal action string.
      return (
        <div>
          {source.audit_levels.map((level) => {
            const mapping = auditMap[level];
            return (
              <Fragment key={level}>
                <div className="flex items-center justify-start gap-1">
                  <div>{mapping.humanReadable}</div>
                  <mapping.Icon className={`h-4 w-4 ${mapping.color}`} />
                </div>
              </Fragment>
            );
          })}
        </div>
      );
    },
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
