// node_modules
import PropTypes from "prop-types";

/**
 * Displays the number of items in a collection above the list or table views.
 */
export default function TableCount({ count }) {
  if (count > 0) {
    return (
      <div
        data-testid="search-results-count"
        className="border-l border-r border-t border-panel bg-gray-300 py-1 text-center text-xs dark:bg-gray-700"
      >
        {count} {count === 1 ? "item" : "items"}
      </div>
    );
  }
  return null;
}

TableCount.propTypes = {
  // Number of items in the collection
  count: PropTypes.number.isRequired,
};
