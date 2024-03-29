// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
// components
import Pager from "../pager";
// components/search-results
import useSearchLimits from "./search-limits";

/**
 * Displays the pager for the search-result pages, including the list and report pages. When the
 * user selects a page, the from= parameter in the URL query string gets updated to reflect the
 * new page.
 */
export default function SearchPager({ searchResults }) {
  const router = useRouter();
  const { itemsPerPage, totalPages } = useSearchLimits(searchResults);

  function onPagerClick(pageIndex) {
    // Calculate the new from= parameter based on the page index.
    const from = (pageIndex - 1) * itemsPerPage;
    let updatedQuery = {};
    if (from === 0) {
      // If the new from= parameter is 0, then remove the from= parameter from the URL query string.
      updatedQuery = { ...router.query };
      delete updatedQuery.from;
    } else {
      // Otherwise, update the from= parameter in the URL query string.
      updatedQuery = { ...router.query, from };
    }
    router.push({ query: updatedQuery });
  }

  // Calculate the currently viewed page index based on the from= parameters in the URL
  // query string.
  const pageIndex = router.query.from
    ? Math.floor(Number(router.query.from) / itemsPerPage) + 1
    : 1;

  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center border-l border-r border-panel bg-gray-100 py-0.5 dark:bg-gray-900">
          <Pager
            currentPage={pageIndex}
            totalPages={totalPages}
            onClick={onPagerClick}
          />
        </div>
      )}
    </>
  );
}

SearchPager.propTypes = {
  // Search results
  searchResults: PropTypes.object.isRequired,
};
