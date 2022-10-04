// node_modules
import PropTypes from "prop-types";
// components
import { Select } from "./form";

/**
 * Generates the list of items per page to offer.
 */
const itemsPerPageOfferings = {
  "View 10 items": 10,
  "View 25 items": 25,
  "View 50 items": 50,
  "View 100 items": 100,
  "View all items": 0,
};

/**
 * Displays a dropdown to select the number of items to display on a collection page. If more items
 * exist than displayed, the parent component typically displays a pager.
 */
const ItemsPerPageSelector = ({
  itemsPerPage,
  setItemsPerPage,
  setPageIndex,
}) => {
  /**
   * Called when the user changes the number of items to display per page. It simply passes the
   * new value to the setter function and sets the current page index to 1.
   * @param {object} e React synthetic event
   */
  const onItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setPageIndex(1);
    }
  };

  return (
    <Select
      name="items-per-page"
      className="flex grow gap-1 [&>div]:w-full"
      value={itemsPerPage}
      onChange={onItemsPerPageChange}
    >
      {Object.keys(itemsPerPageOfferings).map((itemsPerPageItem) => (
        <option
          key={itemsPerPageItem}
          value={itemsPerPageOfferings[itemsPerPageItem]}
        >
          {itemsPerPageItem}
        </option>
      ))}
    </Select>
  );
};

ItemsPerPageSelector.propTypes = {
  // Current number of items per page
  itemsPerPage: PropTypes.number.isRequired,
  // Set a new number of items per page
  setItemsPerPage: PropTypes.func.isRequired,
  // Set the current page index
  setPageIndex: PropTypes.func.isRequired,
};

export default ItemsPerPageSelector;
