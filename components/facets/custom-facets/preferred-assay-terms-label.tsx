// node_modules
import { useContext } from "react";
// components
import { AnnotatedValue } from "../../annotated-value";
import SessionContext from "../../session-context";
// lib
import { getPreferredAssayTitleDescriptionMap } from "../../../lib/ontology-terms";
// root
import type { SearchResultsFacetTerm } from "../../../globals";

/**
 * Displays the term labels for the preferred assay title facet terms. It behaves nearly
 * identically to the standard facet term labels, except it uses the preferred assay title
 * ontology term map to annotate the term labels.
 *
 * @param term - Single term from a facet from the search results
 * @param isNegative - True if the term is negated
 * @param isChildTerm - True if the term is a child term within a sub facet
 */
export default function PreferredAssayTermsLabel({
  term,
  isNegative,
  isChildTerm,
}: {
  term: SearchResultsFacetTerm;
  isNegative: boolean;
  isChildTerm: boolean;
}) {
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  return (
    <div
      className={`flex grow items-center justify-between gap-2 leading-[1.1] [&>*:first-child]:wrap-anywhere ${
        isChildTerm ? "text-xs font-light" : "text-sm font-normal"
      }`}
    >
      <AnnotatedValue externalAnnotations={preferredAssayTitleDescriptionMap}>
        {typeof term.key === "string" ? term.key : String(term.key)}
      </AnnotatedValue>
      {!isNegative && <div>{term.doc_count}</div>}
    </div>
  );
}
