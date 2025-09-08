/**
 * Displays a date-range facet as a button that displays the current active date range. When the
 * button is clicked, a modal opens that allows the user to select a new date range.
 */

// node_modules
import { useState } from "react";
import { DateRange } from "react-date-range";
// components
import { Button } from "../../form-elements";
import Modal from "../../modal";
// lib
import { formatLongDate, getSystemDateRange } from "../../../lib/dates";
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";
// root
import type { SearchResultsFacet, SearchResults } from "../../../globals";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { getFacetDateRange, getFilterDateRange } from "./date-range-lib";

/**
 * Describes the date-range object used for the date-range picker.
 * @property startDate - Start date of the range
 * @property endDate - End date of the range
 * @property key - Unique ID of this date-range selection
 */
type Range = {
  startDate: Date;
  endDate: Date;
  key: string;
};

/**
 * Display a modal containing a date-range picker. The user can select a new date range, and the modal
 * will call the `onDateRangeChange` function with the new start and end dates when the user clicks
 * the "Apply" button. The modal can be closed by clicking the "Cancel" button. The user can also clear
 * the date range by clicking the "Clear" button, which will call the `onDateRangeChange` function with
 * null values. Note we disable jest coverage for `handleDateRangeChange` because it the date-range
 * picker doesn't render during a Jest test, so we can't test the function.
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param startLimit - Earliest date that can be selected
 * @param endLimit - Latest date that can be selected
 * @param onClose - Function to call when the modal is closed without applying changes
 * @param onDateRangeChange - Function to call when the user selects a new date range
 */
function DateRangeModal({
  startDate,
  endDate,
  startLimit,
  endLimit,
  onClose,
  onDateRangeChange,
}: {
  startDate: Date;
  endDate: Date;
  startLimit: Date;
  endLimit: Date;
  onClose: () => void;
  onDateRangeChange: (newStartDate: Date, newEndDate: Date) => void;
}) {
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate,
      endDate,
      key: "selection",
    },
  ]);

  // istanbul ignore next
  function handleDateRangeChange(item: any) {
    setDateRange([item.selection]);
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      widthClasses="w-fit"
      testid="date-range-modal"
    >
      <DateRange
        onChange={handleDateRangeChange}
        editableDateInputs={true}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        ranges={dateRange}
        rangeColors={["#bfa678"]}
        minDate={startLimit}
        maxDate={endLimit}
        direction="vertical"
        scroll={{ enabled: true }}
      />
      <Modal.Footer>
        <Button type="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={() =>
            onDateRangeChange(dateRange[0].startDate, dateRange[0].endDate)
          }
        >
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Display a date-range facet as a button that displays the current active date range. When the
 * button is clicked, a modal opens that allows the user to select a new date range.
 * @param searchResults - The current search results
 * @param facet - The date-range facet to display
 * @param updateQuery - Function to call when the user selects a new date range
 */
export default function DateRangeTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (query: string) => void;
}) {
  // True if the date range modal is open
  const [isOpen, setIsOpen] = useState(false);

  // Extract the date-range terms from the facet
  const [earliestFacetDate, latestFacetDate] = getFacetDateRange(facet);
  const [earliestFilterDate, latestFilterDate] = getFilterDateRange(
    facet.field,
    searchResults.filters
  );
  const earliestDate = earliestFilterDate || earliestFacetDate || null;
  const latestDate = latestFilterDate || latestFacetDate || null;
  const startDate = earliestDate;
  const endDate = latestDate;

  // Called when the user clicks the date range button.
  function onDateRangeTrigger() {
    setIsOpen(true);
  }

  // Set endDateLimit to today's date plus one month.
  const { startLimit, endLimit } = getSystemDateRange();

  // Called when the user applies a new date range from the modal.
  function onDateRangeApply(newStartDate: Date, newEndDate: Date) {
    const { queryString } = splitPathAndQueryString(searchResults["@id"]);
    const query = new QueryString(queryString);

    if (newStartDate === null && newEndDate === null) {
      // If the user clears the date range, remove the date-range filter from the query.
      query.deleteKeyValue(facet.field);
      query.deleteKeyValue("from");
      updateQuery(query.format());
    } else {
      // Get the yyyy-mm-dd format of the new start and end dates.
      const newFacetStartDate = newStartDate.toISOString().split("T")[0];
      const newFacetEndDate = newEndDate.toISOString().split("T")[0];

      // Process the existing query string to remove any old date-range elements and add the new
      // date-range elements.
      query.deleteKeyValue(facet.field);
      query.deleteKeyValue("from");
      query.addKeyValue(facet.field, `gte:${newFacetStartDate}`);
      query.addKeyValue(facet.field, `lte:${newFacetEndDate}`);
      updateQuery(query.format());
    }
  }

  // Convert dateRange start and end dates to human-readable format in long form, e.g. November 11,
  // 1918. I don't currently see a way that we wouldn't have a start and end date (requires no date
  // filters, and no facet data), but I felt uncomfortable assuming they exist.
  if (startDate && endDate) {
    const humanReadableStartDate = formatLongDate(startDate);
    const humanReadableEndDate = formatLongDate(endDate);
    const isResetDisabled =
      earliestFilterDate === null && latestFilterDate === null;

    return (
      <>
        <div className="flex flex-col justify-center gap-1 p-2">
          <button
            className="border-button-secondary bg-button-secondary fill-button-secondary text-button-secondary flex w-full rounded-sm border px-2 py-1"
            onClick={onDateRangeTrigger}
            data-testid={`date-range-trigger-${facet.field}`}
            aria-label={`${facet.title} range from ${humanReadableStartDate} to ${humanReadableEndDate}`}
          >
            <div className="w-1/2 text-left">
              <div className="text-xs">From</div>
              <div className="text-xs font-semibold">
                {humanReadableStartDate}
              </div>
            </div>
            <div className="w-1/2 text-left">
              <div className="text-xs">To</div>
              <div className="text-xs font-semibold">
                {humanReadableEndDate}
              </div>
            </div>
          </button>
          <Button
            size="sm"
            type="secondary"
            id={`date-range-reset-${facet.field}`}
            isDisabled={isResetDisabled}
            onClick={() => onDateRangeApply(null, null)}
          >
            Reset Date Range
          </Button>
        </div>
        {isOpen && (
          <DateRangeModal
            onClose={() => setIsOpen(false)}
            startDate={startDate}
            endDate={endDate}
            startLimit={startLimit}
            endLimit={endLimit}
            onDateRangeChange={(newStartDate, newEndDate) => {
              setIsOpen(false);
              onDateRangeApply(newStartDate, newEndDate);
            }}
          />
        )}
      </>
    );
  }
}
