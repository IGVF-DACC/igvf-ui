// node_modules
import PropTypes from "prop-types";
// components
import { AuditDetail, useAudit } from "./audit";
import { EditLink } from "./edit-func";
import QualitySection from "./quality-section";
import { JsonLink } from "./json-button";

/**
 * Display the header above the data areas of an object page.
 */
export default function ObjectPageHeader({ item }) {
  const auditState = useAudit();

  return (
    <>
      <div className="flex justify-between">
        <QualitySection item={item} auditState={auditState} />
        <div className="flex justify-end gap-1">
          <EditLink item={item} />
          <JsonLink item={item} />
        </div>
      </div>
      <AuditDetail item={item} auditState={auditState} className="mb-2" />
    </>
  );
}

ObjectPageHeader.propTypes = {
  // Single object from data provider
  item: PropTypes.object.isRequired,
};
