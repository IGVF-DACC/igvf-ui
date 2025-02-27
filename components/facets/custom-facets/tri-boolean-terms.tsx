// node_modules
import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
// root
import type {
  SearchResultsFacet,
  SearchResultsFacetTerm,
  SearchResults,
} from "../../../globals.d";

/**
 * The radio button mechanism requires a number corresponding to the selected boolean term. Use
 * this to represent the three possible states of a boolean term.
 */
const enum TriBoolean {
  False = 0,
  True = 1,
  Either = 2,
}

/**
 * Determine the current selection value of the facet for the given field. The value is determined
 * by the presence of filters for the current facet's field in the search-results object.
 * @param field - Field name of the facet being rendered
 * @param searchResults - Entire search results object from the data provider
 * @returns Current selection value of the facet for the given field
 */
function currentSelection(
  field: string,
  searchResults: SearchResults
): TriBoolean {
  const fieldFilters = searchResults.filters.filter(
    (filter) => filter.field === field
  );
  if (fieldFilters.length === 0) {
    return TriBoolean.Either;
  }
  if (fieldFilters.every((filter) => filter.term === "false")) {
    return TriBoolean.False;
  }
  if (fieldFilters.every((filter) => filter.term === "true")) {
    return TriBoolean.True;
  }
  return TriBoolean.Either;
}

export default function TriBooleanTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (facet: string, term: string) => void;
}) {
  function onChange(clickedValue: number) {
    console.log("ONCHANGE", clickedValue);
  }

  console.log("TRI SEARCH", searchResults);
  console.log("TRI FACET", facet);
  console.log("TRI UPDATE", updateQuery);

  // Build array of available boolean terms as well as "either"
  const eitherTerm: SearchResultsFacetTerm = {
    doc_count: facet.total,
    key: TriBoolean.Either,
    key_as_string: "either",
  };
  const terms = facet.terms.concat(eitherTerm);

  // Determine the selected term.
  const selectedValue = currentSelection(facet.field, searchResults);

  return (
    <RadioGroup
      value={selectedValue}
      onChange={onChange}
      aria-label="Boolean filter"
      className="p-2"
    >
      {terms.map((term) => (
        <Field key={term.key} className="flex items-center gap-2 px-2">
          <Radio
            value={term.key}
            className="group flex size-4 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
          >
            <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
          </Radio>
          <Label className="flex w-full justify-between">
            <div>{term.key_as_string}</div>
            <div>{term.doc_count}</div>
          </Label>
        </Field>
      ))}
    </RadioGroup>
  );
}
