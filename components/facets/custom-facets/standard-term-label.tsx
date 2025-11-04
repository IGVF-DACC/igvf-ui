// root
import type { SearchResultsFacetTerm } from "../../../globals";

/**
 * Displays the standard term label for the standard facet terms. It shows the term name at the
 * left of the space, and the count of terms on the right.
 *
 * @param term - Single term from a facet from the search results
 * @param isNegative - True if the term is negated
 * @param isChildTerm - True if the term is a child term within a sub facet
 */
export default function StandardTermLabel({
  term,
  isNegative,
  isChildTerm,
}: {
  term: SearchResultsFacetTerm;
  isNegative: boolean;
  isChildTerm: boolean;
}) {
  return (
    <div
      className={`flex grow items-center justify-between gap-2 leading-[1.1] [&>div:first-child]:wrap-anywhere ${
        isChildTerm ? "text-xs font-light" : "text-sm font-normal"
      }`}
    >
      <div>{term.key_as_string || term.key}</div>
      {!isNegative && <div>{term.doc_count}</div>}
    </div>
  );
}
