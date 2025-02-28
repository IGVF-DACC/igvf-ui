// node_modules
import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
// lib
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";
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

/**
 * Custom facet terms component for boolean facets. This component renders a radio group with three
 * options: "true", "false", and "either". The "either" option is selected when the query string
 * doesn't contain any elements relevant to the current facet field. The "true" and "false" options
 * are selected when the query string contains the corresponding value for the current facet field.
 * In addition, a mix of "true" and "false" values will result in the "either" option being selected.
 * @param searchResults - Entire search results object from the data provider
 * @param facet - Facet object for the current field
 * @param updateQuery - Function to update the query string in the URL
 */
export default function TriBooleanTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  // Generate a query based on the current URL to update once the user clicks a facet term.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  function onChange(clickedValue: number) {
    // Clear all filters for the current facet field, then add the selected value if not "either".
    query.deleteKeyValue(facet.field);
    if (clickedValue === TriBoolean.False) {
      query.addKeyValue(facet.field, "false");
    } else if (clickedValue === TriBoolean.True) {
      query.addKeyValue(facet.field, "true");
    }
    query.deleteKeyValue("from");
    query.deleteKeyValue(facet.field, "*");
    updateQuery(query.format());
  }

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
      aria-label={`${facet.title} boolean selector`}
      className="p-2"
    >
      {terms.map((term) => (
        <Field
          key={term.key}
          className="flex cursor-pointer items-center gap-2 rounded border border-transparent px-2 hover:border-data-border"
        >
          <Radio
            value={term.key}
            className="group flex size-4 items-center justify-center rounded-full border bg-white data-[checked]:bg-gray-500"
          >
            <span className="invisible size-1.5 rounded-full bg-white group-data-[checked]:visible" />
          </Radio>
          <Label
            className="flex w-full cursor-pointer justify-between text-sm"
            aria-label={`${term.key_as_string} with ${term.doc_count} ${
              term.doc_count === 1 ? "result" : "results"
            }`}
          >
            <div>{term.key_as_string}</div>
            <div>{term.doc_count}</div>
          </Label>
        </Field>
      ))}
    </RadioGroup>
  );
}
