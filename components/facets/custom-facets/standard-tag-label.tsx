// lib
import { getFilterTerm } from "../../../lib/facets";
// root
import type { SearchResultsFilter } from "../../../globals";

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
  return <>{term}</>;
}
