// lib
import { getFilterTerm } from "../../../lib/facets";
import { truncateText } from "../../../lib/general";
// root
import type { SearchResultsFilter } from "../../../globals";

/**
 * Maximum length for the term displayed in the tag label. Terms longer than this will be truncated.
 */
const MAX_TERM_LENGTH = 50;

/**
 * Display the standard facet tag label. This is the default tag label for all facets that do not
 * have a custom tag label.
 *
 * When the tag term is `*`, the tag label displays as `ANY` or `NOT` depending on whether the tag
 * field ends with `!`.
 *
 * @param filter - Filter object from search results
 */
export default function StandardTagLabel({
  filter,
}: {
  filter: SearchResultsFilter;
}) {
  const term = getFilterTerm(filter);
  return <>{truncateText(term, MAX_TERM_LENGTH)}</>;
}
