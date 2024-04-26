// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Status from "./status";

/**
 * Display a link to an item's summary page along with its abbreviated status.
 */
export default function LinkedIdAndStatus({
  item,
  status = "",
  className = null,
  children,
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Link href={item["@id"]} className="block">
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
  // Additional Tailwind CSS classes for the wrapper div
  className: PropTypes.string,
};
