// node_modules
import PropTypes from "prop-types";
// components
import Link from "./link-no-prefetch";
import Status from "./status";

/**
 * Display a link to an item's summary page along with its abbreviated status.
 */
export default function LinkedIdAndStatus({
  item,
  status = "",
  isTargetBlank = false,
  className = null,
  children,
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Link
          href={item["@id"]}
          className="block"
          {...(isTargetBlank
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </Link>
        <Status status={status || item.status} isAbbreviated />
      </div>
    </div>
  );
}

LinkedIdAndStatus.propTypes = {
  // Item to display the accession and status of
  item: PropTypes.object.isRequired,
  // Status to display if not using `item.status`
  status: PropTypes.string,
  // Open the link in a new tab
  isTargetBlank: PropTypes.bool,
  // Additional Tailwind CSS classes for the wrapper div
  className: PropTypes.string,
};
