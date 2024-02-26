// node_modules
import PropTypes from "prop-types";
// components
import { auditMap } from "../../audit";

/**
 * Maps an audit level to an icon background.
 */
export const auditBackgroundMap = {
  ERROR: ErrorIconBackground,
  WARNING: WarningIconBackground,
  NOT_COMPLIANT: NotCompliantIconBackground,
  INTERNAL_ACTION: InternalIconBackground,
};

/**
 * The following small components render the custom icons for each audit level.
 */
function ErrorIconBackground({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-error-icon-bg"
    >
      <path
        d="M19.7,15.5L12,2.2c-0.4-0.7-1.2-1.1-2-1.1S8.4,1.5,8,2.2L0.3,15.5c-0.4,0.7-0.4,1.6,0,2.3
	c0.4,0.7,1.2,1.2,2,1.2h15.4c0.8,0,1.6-0.4,2-1.2C20.1,17.1,20.1,16.2,19.7,15.5z"
      />
    </svg>
  );
}

ErrorIconBackground.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

function WarningIconBackground({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-warning-icon"
    >
      <path
        d="M0.3,4.5L8,17.8c0.4,0.7,1.2,1.1,2,1.1s1.6-0.4,2-1.2l7.7-13.3c0.4-0.7,0.4-1.6,0-2.3c-0.4-0.7-1.2-1.2-2-1.2H2.3
	c-0.8,0-1.6,0.4-2,1.2C-0.1,2.9-0.1,3.8,0.3,4.5z"
      />
    </svg>
  );
}

WarningIconBackground.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

function NotCompliantIconBackground({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-warning-icon"
    >
      <path d="M15.8,0H4.2C1.9,0,0,1.9,0,4.2v11.5C0,18.1,1.9,20,4.2,20h11.5c2.4,0,4.3-1.9,4.3-4.3V4.2C20,1.9,18.1,0,15.8,0z" />
    </svg>
  );
}

NotCompliantIconBackground.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

function InternalIconBackground({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-warning-icon"
    >
      <circle cx="10" cy="10" r="10" />
    </svg>
  );
}

InternalIconBackground.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

/**
 * Displays the title for audit facets. These show a shortened title and an icon matching the icons
 * in the audit panels. This component gets used for the titles of all audit categories.
 */
export default function AuditTitle({ facet }) {
  // Extract the audit type from the facet field name, and use it to get the color and title.
  const auditType = facet.field.split(".")[1];
  const mapping = auditMap[auditType];
  const IconBackground = auditBackgroundMap[auditType];

  return (
    <h2
      className="mb-1 bg-facet-title text-center text-base font-medium text-facet-title"
      data-testid={`facettitle-${facet.field}`}
    >
      <div className="flex items-center justify-center gap-1">
        <div>Audit {mapping.humanReadable}</div>
        <div className="relative h-4 w-4">
          <IconBackground className="fill-audit-facet absolute bottom-0 left-0 right-0 top-0" />
          <mapping.Icon
            className={`absolute bottom-0 left-0 right-0 top-0 ${mapping.color}`}
          />
        </div>
      </div>
    </h2>
  );
}

AuditTitle.propTypes = {
  // Audit facet object
  facet: PropTypes.shape({
    // Audit property name including the audit type
    field: PropTypes.string.isRequired,
  }).isRequired,
};
