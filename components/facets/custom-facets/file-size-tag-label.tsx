// lib
import { dataSize } from "../../../lib/general";
// root
import { SearchResultsFilter } from "../../../globals";

/**
 * Display the facet tag label for file-size range terms with magnitudes (e.g. KB, GB). This
 * converts the term from `gte:0` to `> 0B` and `lte:100000` to `< 100KB`. Don't have to worry too
 * much about bad formatting because the server should have already validated the query.
 * @param filter Filter object for the facet
 */
export default function FileSizeTagLabel({
  filter,
}: {
  filter: SearchResultsFilter;
}) {
  // Extract the file size value in bytes from the filter as well as the gte or lte operator.
  const value = filter.term.replace(/(gte:|lte:)/, "");
  const operator = filter.term.startsWith("gte:") ? ">" : "<";

  // Convert the value to a size with the appropriate magnitude
  const sizeLabel = dataSize(parseInt(value));

  return (
    <span>
      {operator} {sizeLabel}
    </span>
  );
}
