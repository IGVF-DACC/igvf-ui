// root
import type { SearchResultsFacetTerm } from "../../../globals.d";

/**
 * Custom term-label component for the taxa facet. It displays the same as the standard term label,
 * but with the term name in italics.
 *
 * @param term - Single term from a facet from the search results
 * @param isNegative - True if the term is negated
 */
export default function TaxaTermLabel({
  term,
  isNegative,
}: {
  term: SearchResultsFacetTerm;
  isNegative: boolean;
}) {
  return (
    <div className="flex grow items-center justify-between gap-2 text-sm leading-[1.1] font-normal">
      <div className="italic">{term.key}</div>
      {!isNegative && <div>{term.doc_count}</div>}
    </div>
  );
}
