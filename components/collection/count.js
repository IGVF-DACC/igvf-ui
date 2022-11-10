// node_modules
import PropTypes from "prop-types";

/**
 * Displays the number of items in a collection above the list or table views.
 */
const CollectionCount = ({ count }) => {
  if (count > 0) {
    return (
      <div className="border-t border-r border-l border-panel bg-gray-300 py-1 text-center text-xs dark:bg-gray-700">
        {count} {count === 1 ? "item" : "items"}
      </div>
    );
  }
  return null;
};

CollectionCount.propTypes = {
  // Number of items in the collection
  count: PropTypes.number.isRequired,
};

export default CollectionCount;
