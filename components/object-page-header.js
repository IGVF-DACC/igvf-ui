// node_modules
import PropTypes from "prop-types";
// components
import { AuditDetail, useAudit } from "./audit";
import { EditLink } from "./edit-func";
import { JsonViewLink, ObjectViewLink } from "./json-button";
import QualitySection from "./quality-section";

/**
 * Display the header above the data areas of an object page.
 */
export default function ObjectPageHeader({ item, isJsonFormat }) {
  const auditState = useAudit();

  return (
    <>
      <div className="flex justify-between">
        <QualitySection item={item} auditState={auditState} />
        <div className="flex justify-end gap-1">
          <EditLink item={item} />
          {isJsonFormat ? (
            <ObjectViewLink item={item} />
          ) : (
            <JsonViewLink item={item} />
          )}
        </div>
      </div>
      <AuditDetail item={item} auditState={auditState} className="mb-2" />
    </>
  );
}

ObjectPageHeader.propTypes = {
  // Single object from data provider
  item: PropTypes.object.isRequired,
  // is this view in Json format
  isJsonFormat: PropTypes.bool.isRequired,
};
