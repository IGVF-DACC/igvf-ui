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

/*display: (cell, meta) => {
  const fileSet = meta.derivedFromFileSets.find(
    (fileSet) => fileSet["@id"] === cell.source.file_set
  );
  return fileSet && <Link href={fileSet["@id"]}>{fileSet.accession}</Link>;
},*/
/**
 * Display a sortable table of the given audits.
 */
export default function AuditDynamicTable({ data }) {
  return (
    <DataGridContainer>
      <SortableGrid data={data} columns={auditColumns} />
    </DataGridContainer>
  );
}

AuditDynamicTable.propTypes = {
  // Audits to display
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
