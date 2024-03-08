// node_modules
import PropTypes from "prop-types";
import { Fragment, useRef } from "react";
// components
import { auditMap } from "./audit";
import { DataGridContainer } from "./data-grid";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import TableCount from "./table-count";

const auditKeyColumns = [
  {
    id: "audit_level",
    title: "Severity Level",
    display: ({ source }) => {
      const auditLevel = source.audit_level;
      const mapping = auditMap[auditLevel];
      return (
        <div>
          <Fragment key={auditLevel}>
            <div className="flex items-center justify-start gap-1">
              <mapping.Icon className={`h-4 w-4 ${mapping.color}`} />
              <div>{mapping.humanReadable}</div>
            </div>
          </Fragment>
        </div>
      );
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
export default function AuditKeyTable({ data }) {
  const gridRef = useRef(null);

  return (
    <>
      <TableCount count={data.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid data={data} columns={auditKeyColumns} />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

AuditKeyTable.propTypes = {
  // Audits to display
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
