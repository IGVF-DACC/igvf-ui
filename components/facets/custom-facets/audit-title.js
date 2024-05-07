// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import PropTypes from "prop-types";
// components
import { auditMap } from "../../audit";

/**
 * Displays the title for audit facets. These show a shortened title and an icon matching the icons
 * in the audit panels. This component gets used for the titles of all audit categories.
 */
export default function AuditTitle({ facet }) {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated || facet.field !== "audit.INTERNAL_ACTION.category") {
    // Extract the audit type from the facet field name, and use it to get the color and title.
    const auditType = facet.field.split(".")[1];
    const mapping = auditMap[auditType];

    return (
      <h2
        className="mb-1 bg-facet-title text-center text-base font-medium text-facet-title"
        data-testid={`facettitle-${facet.field}`}
      >
        <div className="flex items-center justify-center gap-1">
          <div>Audit {mapping.humanReadable}</div>
          <div className="relative h-4 w-4">
            <mapping.Icon
              className={`absolute bottom-0 left-0 right-0 top-0 ${mapping.color}`}
            />
          </div>
        </div>
      </h2>
    );
  }
  return null;
}

AuditTitle.propTypes = {
  // Audit facet object
  facet: PropTypes.shape({
    // Audit property name including the audit type
    field: PropTypes.string.isRequired,
  }).isRequired,
};
