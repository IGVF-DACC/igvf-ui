// root
import { SearchResultsFilter } from "../../../globals";

/**
 * Display the facet tag label for range terms. This converts the term from `gte:0` to `>0` and
 * `lte:100` to `<100`.
 * @param filter Filter object for the facet
 */
export default function StatsTagLabel({
  filter,
}: {
  filter: SearchResultsFilter;
}) {
  const term = filter.term.replace(/^(gte:|lte:)/, (match) => {
    if (match === "gte:") {
      return ">";
    }
    if (match === "lte:") {
      return "<";
    }
    return match;
  });
  return <>{term}</>;
}
