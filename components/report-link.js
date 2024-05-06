// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { ButtonLink } from "./form-elements";

/**
 * Display a button that links to a report view.
 */
export default function ReportLink({ href, className = null }) {
  return (
    <div className={className}>
      <ButtonLink href={href} size="sm" isInline>
        <TableCellsIcon className="h-4 w-4" />
      </ButtonLink>
    </div>
  );
}

ReportLink.propTypes = {
  // Link to the report view
  href: PropTypes.string.isRequired,
  // Additional Tailwind CSS classes to apply to the list
  className: PropTypes.string,
};
