// components
import Checkbox from "../checkbox";
// components/facets
import facetRegistry from "./facet-registry";
// lib
import { toShishkebabCase } from "../../lib/general";
import { encodeUriElement } from "../../lib/query-encoding";
// root
import { SearchResultsFacetTerm } from "../../globals";

/**
 * Display a single term in a facet with a checkbox.
 *
 * @param field - Facet field the term belongs to
 * @param term - Term to display in the checkbox
 * @param isChecked - True if the checkbox is checked
 * @param isNegative - True if the term is negated
 * @param parentField - Field name of the parent term if this term is a child term
 * @param parent - Parent term object if this term is a child term
 * @param onClick - Called when the checkbox is checked or unchecked
 */
export default function FacetTerm({
  field,
  term,
  isChecked,
  isNegative,
  parentField = "",
  parent = null,
  onClick,
}: {
  field: string;
  term: SearchResultsFacetTerm;
  isChecked: boolean;
  isNegative: boolean;
  parentField?: string;
  parent?: SearchResultsFacetTerm;
  onClick: (
    field: string,
    term: SearchResultsFacetTerm,
    isLongClick: boolean,
    parentField?: string,
    parent?: SearchResultsFacetTerm
  ) => void;
}) {
  const TermLabel = facetRegistry.termLabel.lookup(field);
  const id = `${field}-${toShishkebabCase(
    encodeUriElement(term.key_as_string || String(term.key))
  )}${parent ? `-${toShishkebabCase(String(parent.key))}` : ""}`;

  return (
    <li data-testid={`facetterm-${id}`}>
      <Checkbox
        id={`facet-checkbox-${id}`}
        checked={isChecked}
        name={`${term.key_as_string || term.key} with ${term.doc_count} result${
          term.doc_count > 1 ? "s" : ""
        }`}
        onClick={() => onClick(field, term, false, parentField, parent)}
        onLongClick={() => onClick(field, term, true, parentField, parent)}
        className={`hover:border-data-border cursor-pointer rounded border border-transparent px-2 py-1 ${
          isNegative ? "line-through" : ""
        }`}
      >
        <TermLabel
          term={term}
          isNegative={isNegative}
          isChildTerm={Boolean(parent)}
        />
      </Checkbox>
    </li>
  );
}
