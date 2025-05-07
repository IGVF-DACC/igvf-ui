// lib
import { UC } from "../../../lib/constants";
import { formatLongDate } from "../../../lib/dates";
// root
import { SearchResultsFilter } from "../../../globals";

/**
 * Display the facet tag label for date-range terms. This handles gte:yyyy-mm-dd and lte:yyyy-mm-dd
 * and converts them to `>= Month Day, Year` and `<= Month Day, Year`. It also handles
 * gt:yyyy-mm-dd and lt:yyyy-mm-dd using less-than and greater-than signs. It also handles the
 * wildcard. Anything else is displayed as is to let the user delete it.
 * @param filter Filter object for the facet
 */
export default function DateRangeTagLabel({
  filter,
}: {
  filter: SearchResultsFilter;
}) {
  // If the filter term starts with "gte:" or "lte:", handle as a date range.
  if (filter.term.startsWith("gte:") || filter.term.startsWith("lte:")) {
    // Extract the date from the filter as well as the gte or lte operator.
    const value = filter.term.replace(/(gte:|lte:)/, "");
    const operator = filter.term.startsWith("gte:") ? UC.ge : UC.le;

    // Convert the value to a size with the appropriate magnitude.
    const dateLabel = formatLongDate(new Date(value));

    return (
      <span>
        {operator} {dateLabel}
      </span>
    );
  }

  if (filter.term.startsWith("gt:") || filter.term.startsWith("lt:")) {
    // Extract the date from the filter as well as the gte or lte operator.
    const value = filter.term.replace(/(gt:|lt:)/, "");
    const operator = filter.term.startsWith("gt:") ? ">" : "<";

    // Convert the value to a size with the appropriate magnitude.
    const dateLabel = formatLongDate(new Date(value));

    return (
      <span>
        {operator} {dateLabel}
      </span>
    );
  }

  // If the filter term is `release_timestamp=*`, display a tag with "Exists." If
  // `release_timestamp!=*`, display a tag with "None."
  if (filter.term === "*") {
    const isNegative = filter.field.endsWith("!");
    return <span>{isNegative ? "None" : "Exists"}</span>;
  }

  // If the filter term is anything else, just display the term as is to let the user delete it.
  return <span>{filter.term}</span>;
}
