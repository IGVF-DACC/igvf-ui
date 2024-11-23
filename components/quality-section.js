// node_modules
import PropTypes from "prop-types";
// components
import { AuditStatus } from "./audit";
import Status from "./status";

/**
 * Display the quality properties of an item object. This includes the status badge and the audit
 * status button and panel.
 */
export default function QualitySection({ item, auditState, children }) {
  return (
    <section className="flex flex-wrap justify-start gap-1 @lg/main:flex-nowrap">
      {item.status && <Status status={item.status} />}
      {item.upload_status && <Status status={item.upload_status} />}
      {children}
      <AuditStatus item={item} auditState={auditState} />
    </section>
  );
}

QualitySection.propTypes = {
  // Item object to display the quality section for.
  item: PropTypes.shape({
    status: PropTypes.string,
    upload_status: PropTypes.string,
    audit: PropTypes.object,
  }),
  // State of the audit detail panel.
  auditState: PropTypes.object.isRequired,
};
