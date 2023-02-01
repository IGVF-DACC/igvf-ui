// node_modules
import { useRouter } from "next/router";
//components/search
import { DEFAULT_ITEMS_PER_PAGE } from "../search/constants";

/**
 * Calculate the total number of pages of search results and the number of items to display per
 * page.
 * @param {object} searchResults Search results for lists or reports
 * @returns {object} returns
 * @returns {number} returns.itemsPerPage - Number of items to display per page
 * @returns {number} returns.totalPages - Total number of pages of results
 */
const useSearchLimits = (searchResults) => {
  const router = useRouter();

  // Get the number of items to display per page from the query string. If the limit= parameter
  // doesn't exist, then use the default number of items per page.
  const itemsPerPage = router.query.limit
    ? Number(router.query.limit)
    : DEFAULT_ITEMS_PER_PAGE;

  const totalPages = Math.ceil(searchResults.total / itemsPerPage);

  return { itemsPerPage, totalPages };
};

export default useSearchLimits;
