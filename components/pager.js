// node_modules
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
// components
import { Button } from "./form-elements";

/**
 * Displays a pager control that lets the user choose a page of data to view, with ellipses
 * representing skipped pages to save horizontal space. Previous/next arrows on either end of the
 * component allow the user to move to the previous and next page to the current page. We have four
 * cases to consider based on the total page count:
 *
 * Seven or fewer: Straight sequence of pages with no ellipses ([x] indicates current page):
 * <  1   2   3   4   5  [6]  7  >
 *
 * More than seven with the current page towards the left end ('.' indicates ellipsis):
 * <  1   2  [3]  4   5   .   20  >
 *
 * More than seven with the current page towards the right end:
 * <  1   .   15  [16]  17   19   20  >
 *
 * More than seven with the current page not near either end:
 * <  1   .   12  [13]  14   .   20  >
 *
 * For cases with more than seven pages, Pager attempts to keep a cluster of visible page numbers
 * surrounding the current page so that the user can see and select the preceding and * succeeding
 * page numbers, except when the current page gets to the extreme ends of the page range and fewer
 * than one page number exists on one side of the cluster. When the current page approaches the
 * ends of the page range, more than one visible page appears in the cluster on the side facing the
 * near end of the page range. This allowance keeps the width of the entire Pager component
 * consistent regardless of the current page number, so that the previous/next buttons don't shift
 * around horizontally.
 */
export default function Pager({ currentPage, totalPages, onClick, className }) {
  // Create the array of 1-based page numbers, with page 0 to represent an ellipsis before the
  // current page and page -1 to represent an ellipsis after the current page. No real difference
  // between these two ellipsis values, but Pager uses distinct values so we don't have duplicate
  // React keys.
  let pageNumbers;
  if (totalPages <= 7) {
    // A total page count of seven or fewer has no ellipses -- just a straight array of
    // sequential numbers.
    pageNumbers = _.range(1, totalPages + 1); // _.range ends at max - 1
  } else {
    // With more than seven pages, build a cluster of pages around the current page, first by
    // determining the minimum and maximum page numbers for the cluster. Allow for filling in
    // extra numbers in the cluster for cases where the current page number approaches the ends
    // of the page range, and cutting off the page numbers when the current page is within a
    // page of either end of the page range.
    const clusterMin = Math.min(Math.max(1, currentPage - 1), totalPages - 4);
    const clusterMax = Math.max(Math.min(currentPage + 1, totalPages), 5);
    const clusterPageNumbers = _.range(clusterMin, clusterMax + 1); // _.range ends at max - 1

    // Determine whether we need an ellipsis before the cluster, or continuous page numbers. If
    // we need an ellipsis before the cluster, then we need an array with page one and a "0" to
    // indicate the left ellipsis.
    const prevFiller = clusterMin >= 4 ? [1, 0] : _.range(1, clusterMin);

    // Determine whether we need an ellipsis after the cluster, or continuous page numbers. If
    // we need an ellipsis after the cluster, then we need an array with a -1 to indicate the
    // right ellipsis followed by the last page number.
    const nextFiller =
      clusterMax <= totalPages - 3
        ? [-1, totalPages]
        : _.range(clusterMax + 1, totalPages + 1);

    // Put together the entire sequence of displayed page numbers and ellipses:
    // prevFiller -- clusterPageNumbers -- nextFiller
    pageNumbers = prevFiller.concat(clusterPageNumbers, nextFiller);
  }

  // Calculate the pixel width of every page number and ellipsis based on the maximum number of
  // digits in a page number.
  const pageNumberWidth = 10 + totalPages.toString().length * 10;

  // Called when the user clicks on a page number.
  function pageNumberClick(pageNumber) {
    if (pageNumber !== currentPage) {
      onClick(pageNumber);
    }
  }

  // Called when the user clicks the previous-page-number arrow.
  function prevClick() {
    if (currentPage !== 1) {
      onClick(currentPage - 1);
    }
  }

  // Called when the user clicks the next-page-number arrow.
  function nextClick() {
    if (currentPage !== totalPages) {
      onClick(currentPage + 1);
    }
  }

  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex shrink sm:gap-2">
        <li>
          <Button
            type="primary"
            onClick={prevClick}
            className="mr-1"
            label="Previous page"
            isDisabled={currentPage === 1}
            hasIconOnly
          >
            <ChevronLeftIcon />
          </Button>
        </li>
        {pageNumbers.map((pageNumber) => {
          // Ellipses pages.
          if (pageNumber === 0 || pageNumber === -1) {
            return (
              <li
                key={pageNumber}
                className="flex items-center"
                style={{ width: pageNumberWidth }}
              >
                <EllipsisHorizontalIcon className="mx-auto h-5 w-5 fill-gray-500" />
              </li>
            );
          }

          // Regular clickable pages.
          const isCurrentPage = pageNumber === currentPage;
          return (
            <li
              key={pageNumber}
              className="flex items-center"
              style={{ width: pageNumberWidth }}
            >
              <button
                type="button"
                className={`block w-full px-1 text-sm ${
                  isCurrentPage
                    ? " rounded-md bg-gray-300 dark:bg-gray-600"
                    : ""
                }`}
                onClick={() => pageNumberClick(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={isCurrentPage ? "page" : null}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}
        <li>
          <Button
            type="primary"
            className="ml-1"
            onClick={nextClick}
            label="Next page"
            isDisabled={currentPage === totalPages}
            hasIconOnly
          >
            <ChevronRightIcon />
          </Button>
        </li>
      </ul>
    </nav>
  );
}

Pager.propTypes = {
  // Currently selected page
  currentPage: PropTypes.number.isRequired,
  // Total number of pages
  totalPages: PropTypes.number.isRequired,
  // Called when the user clicks a button in the pager; passes the new page number
  onClick: PropTypes.func.isRequired,
  // Tailwind CSS classes to add to the pager
  className: PropTypes.string,
};
