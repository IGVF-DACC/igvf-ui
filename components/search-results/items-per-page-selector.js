// node_modules
import { useRouter } from "next/router";
// components
import { Select } from "../form-elements";
// components/search
import { DEFAULT_ITEMS_PER_PAGE } from "../search/constants";
import useSearchLimits from "./search-limits";
// lib
import { getQueryStringFromServerQuery } from "../../lib/query-utils";

/**
 * Items per page to offer in the dropdown menu.
 */
const itemsPerPageOptions = [25, 100, 300];

/**
 * Displays a dropdown to select the number of items to display on a search-result page from the
 * options defined in `itemsPerPageOptions`. The currently selected option gets set from the limit=
 * parameter in the URL query string. If the limit= parameter doesn't exist in the URL, then the
 * default number of items per page gets used.
 *
 * When the user selects a new number of items per page, the limit= parameter in the URL query
 * string gets updated and we navigate to the /search/ page with this new limit= value. If the new
 * number of items per page equals the default, then the limit= parameter gets removed from the URL
 * query string.
 *
 * If the user manually sets the limit= parameter in the URL query string to a value included in
 * `itemsPerPageOptions`, then the dropdown menu shows that value as selected. If the user's limit=
 * value doesn't exist in `itemsPerPageOptions`, then the dropdown menu shows the user's value as
 * selected along with the options in `itemsPerPageOptions`. Once the user selects a new value from
 * the dropdown, their manually set value disappears from the dropdown, leaving only the options in
 * `itemsPerPageOptions`.
 */
export default function ItemsPerPageSelector(searchResults) {
  const router = useRouter();
  const { itemsPerPage } = useSearchLimits(searchResults);

  function onChangeItemsPerPage(e) {
    const newItemsPerPage = Number(e.target.value);

    // Update the `limit` query parameter based on the user's selection.
    let updatedQueryParams;
    if (newItemsPerPage === DEFAULT_ITEMS_PER_PAGE) {
      // Remove the limit= parameter from the query string.
      updatedQueryParams = { ...router.query };
      delete updatedQueryParams.limit;
    } else {
      // Update the limit= parameter in the query string according to the user's selection.
      updatedQueryParams = { ...router.query, limit: newItemsPerPage };
    }
    delete updatedQueryParams.from;

    // Navigate to the same search page with the updated limit= parameter.
    const query = getQueryStringFromServerQuery(updatedQueryParams);
    router.push(`${router.pathname}?${query}`);
  }

  // Add the current limit= to the dropdown options if it's not one of the predefined options.
  const options = itemsPerPageOptions.includes(itemsPerPage)
    ? itemsPerPageOptions
    : [itemsPerPage, ...itemsPerPageOptions];

  return (
    <Select
      name="items-per-page"
      className="flex grow gap-1 [&>div]:w-full"
      value={itemsPerPage}
      onChange={onChangeItemsPerPage}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {`${option} Items`}
        </option>
      ))}
    </Select>
  );
}
