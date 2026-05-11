// node_modules
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
// components
import { Select } from "../components/form-elements";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { isSearchResults } from "../lib/search-results";
// root
import { SearchResultsFacet, SearchResultsFacetTerm } from "../globals";

/**
 * Type definition for the props of the page component, which includes the facets data fetched from
 * the backend to display in the dropdown facets demo.
 *
 * @prop facets - Facets data to display on the page fetched from the igvfd server
 * @prop selections - Currently selected facet-term keys; determines which checkboxes are checked
 */
type Props = {
  facets: SearchResultsFacet[];
  slimsSelections: string[];
  titleSelection: string;
};

function SubFacetDropdown({
  subTerms,
  value,
  parentTermKey,
  onChange,
}: {
  subTerms: SearchResultsFacetTerm[];
  value: string;
  parentTermKey: string | number;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      name={`sub-dropdown-${parentTermKey}`}
      value={value}
      size="sm"
      onChange={(event) => onChange(event.target.value)}
    >
      {subTerms.map((item) => (
        <option key={item.key} value={item.key_as_string || String(item.key)}>
          {item.key_as_string || String(item.key)}
        </option>
      ))}
    </Select>
  );
}

/**
 * Display a single term of the demo facets with a checkbox and a button to open the dropdown for
 * child terms if they exist.
 *
 * @param term - Term data to display in the checkbox and dropdown
 */
function Term({
  term,
  isSelected,
  selectedSubTermKey,
  selectionHandler,
}: {
  term: SearchResultsFacetTerm;
  isSelected: boolean;
  selectedSubTermKey: string;
  selectionHandler: (
    value: string,
    isSelected: boolean,
    isParent: boolean
  ) => void;
}) {
  const subTerms =
    term.subfacet && isTermsDataArray(term.subfacet.terms)
      ? term.subfacet.terms
      : [];

  return (
    <div className="align-center my-1 flex justify-between text-sm">
      <label className="flex cursor-pointer gap-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            selectionHandler(String(term.key), e.target.checked, true);
          }}
          className="cursor-pointer"
        />
        {term.key_as_string || String(term.key)}
      </label>

      <div className="flex w-[16ch] shrink-0">
        <SubFacetDropdown
          subTerms={subTerms}
          value={selectedSubTermKey}
          parentTermKey={term.key}
          onChange={(value) => selectionHandler(value, true, false)}
        />
        <div className="w-[4ch] text-right tabular-nums">{term.doc_count}</div>
      </div>
    </div>
  );
}

/**
 * Type guard to check if an item is an array of SearchResultsFacetTerm objects, which is the
 * expected shape of the `terms` property on a SearchResultsFacet object returned from the backend
 * for facet data.
 *
 * @param data - Data to test for its appearance as a search results facet term
 * @returns True if the data appears to be a search results facet term array
 */
function isTermsDataArray(data: unknown): data is SearchResultsFacetTerm[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "key" in item &&
        "doc_count" in item
    )
  );
}

/**
 * Main page component for the dropdown facets demo page.
 *
 * @param facets - Facets data to display on the page fetched from the igvfd server
 */
export default function App({
  facets,
  slimsSelections,
  titleSelection,
}: Props) {
  const router = useRouter();

  const preferredAssaySlimsFacet = facets.find(
    (facet) => facet.field === "preferred_assay_slims"
  );

  const terms = preferredAssaySlimsFacet ? preferredAssaySlimsFacet.terms : [];
  if (!isTermsDataArray(terms)) {
    throw new Error(
      `Unexpected facet terms data shape: ${JSON.stringify(terms)}`
    );
  }

  // Handle a term-selection click by updating the URL query parameters to reflect the new
  // selection state.
  function selectionHandler(
    value: string,
    isSelected: boolean,
    isParent: boolean
  ) {
    if (isParent) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          preferred_assay_slims: isSelected
            ? [...slimsSelections, value]
            : slimsSelections.filter((s) => s !== value),
        },
      });
    } else {
      // For a child-term selection, we want to replace the `preferred_assay_titles` query parameter
      // with the selected child term value, since the dropdown is meant to select a single child
      // term at a time.
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          preferred_assay_titles: value,
        },
      });
    }
  }

  return (
    <main className="w-100">
      {terms.map((term) => {
        const isSelected = slimsSelections.includes(String(term.key));
        return (
          <Term
            key={term.key}
            term={term}
            isSelected={isSelected}
            selectedSubTermKey={titleSelection}
            selectionHandler={selectionHandler}
          />
        );
      })}
    </main>
  );
}

/**
 * Server-side function to fetch the facets data for the page.
 *
 * @param context Next.js server-side context from request and URL query
 * @returns Props for the page component
 */
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> {
  const { req, query } = context;

  // Convert the query parameters to a URL query string to append to the backend request.
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.append(key, value);
    }
  }

  // Add any extra query parameters to the request.
  const extraQueryParams = params.toString();
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const response = (
    await request.getObject(
      `/search/?type=MeasurementSet${
        extraQueryParams ? `&${extraQueryParams}` : ""
      }`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(response)) {
    if (!isSearchResults(response)) {
      throw new Error(
        `Unexpected response shape for search results: ${JSON.stringify(response.data)}`
      );
    }

    const slimsSelections = params.getAll("preferred_assay_slims");
    const titleSelection = params.get("preferred_assay_titles") || "";

    return {
      props: {
        facets: response.facets || [],
        slimsSelections,
        titleSelection,
      },
    };
  }

  return errorObjectToProps(response);
}
