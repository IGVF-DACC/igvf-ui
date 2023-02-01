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
const SearchPager = ({ searchResults }) => {
  const router = useRouter();
  const { itemsPerPage, totalPages } = useSearchLimits(searchResults);

  const onPagerClick = (pageIndex) => {
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
  };

  // Calculate the currently viewed page index based on the from= parameters in the URL
  // query string.
  const pageIndex = router.query.from
    ? Math.floor(Number(router.query.from) / itemsPerPage) + 1
    : 1;

  return (
    <>
      {totalPages > 1 && (
        <div className="search-pager">
          <Pager
            currentPage={pageIndex}
            totalPages={totalPages}
            onClick={onPagerClick}
            className="mb-2 flex justify-center sm:mb-0 sm:block sm:justify-start"
          />
        </div>
      )}
    </>
  );
};

SearchPager.propTypes = {
  // Search results
  searchResults: PropTypes.object.isRequired,
};

export default SearchPager;
