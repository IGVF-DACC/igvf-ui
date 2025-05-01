// lib
import { UC } from "../../../lib/constants";
import { dataSize } from "../../../lib/general";
// root
import { SearchResultsFilter } from "../../../globals";

/**
 * Display the facet tag label for file-size range terms with magnitudes (e.g. KB, GB). This
 * converts the term from `gte:0` to `> 0B` and `lte:100000` to `< 100KB`. Don't have to worry too
 * much about bad formatting because the server should have already validated the query. Also
 * handle individual numbers and the `file_size=*` and `file_size!=*` cases.
 * @param filter Filter object for the facet
 */
export default function FileSizeTagLabel({
  filter,
}: {
  filter: SearchResultsFilter;
}) {
  // If the filter term starts with "gte:" or "lte:", handle as a file-size range.
  if (filter.term.startsWith("gte:") || filter.term.startsWith("lte:")) {
    // Extract the file size value in bytes from the filter as well as the gte or lte operator.
    const value = filter.term.replace(/(gte:|lte:)/, "");
    const operator = filter.term.startsWith("gte:") ? UC.ge : UC.le;

    // Convert the value to a size with the appropriate magnitude.
    const sizeLabel = dataSize(parseInt(value));

    return (
      <span>
        {operator} {sizeLabel}
      </span>
    );
  }

  // If the filter term starts with "gt:" or "lt:", handle as a file-size range.
  if (filter.term.startsWith("gt:") || filter.term.startsWith("lt:")) {
    // Extract the file size value in bytes from the filter as well as the gte or lte operator.
    const value = filter.term.replace(/(gt:|lt:)/, "");
    const operator = filter.term.startsWith("gt:") ? ">" : "<";

    // Convert the value to a size with the appropriate magnitude.
    const sizeLabel = dataSize(parseInt(value));

    return (
      <span>
        {operator} {sizeLabel}
      </span>
    );
  }

  // If the filter term contains a number, handle as a tag with that number.
  if (filter.term.match(/^\d+$/)) {
    // Convert the value to a size with the appropriate magnitude.
    const sizeLabel = dataSize(parseInt(filter.term));
    return <span>{sizeLabel}</span>;
  }

  // If the filter term is `file_size=*`, display a tag with "Exists." If `file_size!=*`, display a
  // tag with "None."
  if (filter.term === "*") {
    const isNegative = filter.field.endsWith("!");
    return <span>{isNegative ? "None" : "Exists"}</span>;
  }
}
