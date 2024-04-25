// node_modules
import PropTypes from "prop-types";
// components
import LinkedIdAndStatus from "./linked-id-and-status";

/**
 * Displays a stack of linked IDs and their statuses.
 */
export default function LinkedIdAndStatusStack({
  items,
  className = null,
  children,
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <LinkedIdAndStatus
          key={item["@id"]}
          item={item}
          className="my-1 first:mt-0 last:mb-0"
        >
          {children(item)}
        </LinkedIdAndStatus>
      ))}
    </div>
  );
}

LinkedIdAndStatusStack.propTypes = {
  // Items to display the accession and status of in a stack
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Additional Tailwind CSS classes for the wrapper div
  className: PropTypes.string,
};
