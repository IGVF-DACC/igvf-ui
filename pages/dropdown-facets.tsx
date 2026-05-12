// node_modules
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { isSearchResults } from "../lib/search-results";
// components
import { SelectMenu } from "../components/select-menu";
// root
import {
  SearchResultsFacet,
  SearchResultsFacetTerm,
  SearchResultsFilter,
} from "../globals";

/**
 * Type definition for the props of the page component, which includes the facets data fetched from
 * the backend to display in the dropdown facets demo.
 *
 * @prop facets - Facets data to display on the page fetched from the igvfd server
 * @prop selections - Currently selected facet-term keys; determines which checkboxes are checked
 */
type Props = {
  titlesFacet: SearchResultsFacet | null;
  titlesFilters: SearchResultsFilter[];
  slimsFacet: SearchResultsFacet | null;
  slimsFilters: SearchResultsFilter[];
};

/**
 * Display a single term of the demo facets with a checkbox and a button to open the dropdown for
 * child terms if they exist.
 *
 * @param term - Term data to display in the checkbox and dropdown
 */
function Term({
  term,
  isSelected,
  selectionHandler,
}: {
  term: SearchResultsFacetTerm;
  isSelected: boolean;
  selectionHandler: (value: string, isSelected: boolean) => void;
}) {
  return (
    <div className="align-center my-1 flex justify-between text-sm">
      <label className="flex cursor-pointer gap-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            selectionHandler(String(term.key), e.target.checked);
          }}
          className="cursor-pointer"
        />
        {term.key_as_string || String(term.key)}
      </label>
      <div className="w-[4ch] text-right tabular-nums">{term.doc_count}</div>
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
 * Filter the slims facet terms to only those that appear as children of the given titles terms
 * via their subfacets.
 *
 * @param slimsFacet - Facet for preferred_assay_slims
 * @param titlesTerms - Currently selected terms for the preferred_assay_titles facet
 * @returns `slimFacet` terms that merge the subfacets of the selected `titlesTerms`
 */
function extractRelevantSlimsFacets(
  slimsFacet: SearchResultsFacet,
  titlesTerms: SearchResultsFacetTerm[]
): SearchResultsFacetTerm[] {
  if (!isTermsDataArray(slimsFacet.terms)) {
    return [];
  }

  // Collect all preferred_assay_slims keys that are children of the currently selected
  // preferred_assay_titles terms.
  const relevantSlimsKeys = titlesTerms.reduce<string[]>((acc, titleTerm) => {
    if (
      titleTerm.subfacet &&
      typeof titleTerm.subfacet === "object" &&
      isTermsDataArray(titleTerm.subfacet.terms)
    ) {
      return acc.concat(
        titleTerm.subfacet.terms.map((slimsTerm) => String(slimsTerm.key))
      );
    }
    return acc;
  }, []);

  return relevantSlimsKeys.length > 0
    ? slimsFacet.terms.filter((slimsTerm) =>
        relevantSlimsKeys.includes(String(slimsTerm.key))
      )
    : slimsFacet.terms;
}

/**
 * Main page component for the dropdown facets demo page.
 *
 * @param facets - Facets data to display on the page fetched from the igvfd server
 */
export default function App({
  titlesFacet,
  titlesFilters,
  slimsFacet,
  slimsFilters,
}: Props) {
  const router = useRouter();

  if (!titlesFacet) {
    return <div>No facet data found for preferred assay titles.</div>;
  }

  const selectedTitles = titlesFilters.map((filter) => filter.term);
  const titlesTerms = isTermsDataArray(titlesFacet.terms)
    ? titlesFacet.terms
    : [];
  const selectedTitleTerms = titlesTerms.filter((term) =>
    selectedTitles.includes(String(term.key))
  );
  const relevantSlimsFacets = slimsFacet
    ? extractRelevantSlimsFacets(slimsFacet, selectedTitleTerms)
    : [];

  const selectedSlims = slimsFilters.map((filter) => filter.term);

  // Handle a term-selection click by updating the URL query parameters to reflect the new
  // selection state.
  function selectionHandler(value: string, isSelected: boolean) {
    void router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        preferred_assay_titles: isSelected
          ? [...selectedTitles, value]
          : selectedTitles.filter((s) => s !== value),
      },
    });
  }

  function onItemClick(value: string, close: () => void) {
    const { preferred_assay_slims: _removed, ...restQuery } = router.query;
    void router.push({
      pathname: router.pathname,
      query: {
        ...restQuery,
        preferred_assay_slims: value,
      },
    });
    close();
  }

  return (
    <main className="w-80">
      <SelectMenu>
        {({ close }) => (
          <>
            <SelectMenu.Trigger className="w-full justify-between">
              {selectedSlims.length > 1
                ? "Multiple Categories"
                : selectedSlims[0] || "Categories"}
            </SelectMenu.Trigger>
            <SelectMenu.Items>
              {relevantSlimsFacets.map((term) => {
                return (
                  <SelectMenu.Item
                    key={term.key}
                    onClick={() => onItemClick(String(term.key), close)}
                  >
                    <div className="flex w-full justify-between gap-4">
                      <div>{term.key_as_string || String(term.key)}</div>
                      <div>{term.doc_count}</div>
                    </div>
                  </SelectMenu.Item>
                );
              })}
            </SelectMenu.Items>
          </>
        )}
      </SelectMenu>
      {titlesTerms.map((term) => {
        const isSelected = selectedTitles.includes(String(term.key));
        return (
          <Term
            key={term.key}
            term={term}
            isSelected={isSelected}
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

    const titlesFacet = response.facets.find(
      (facet) => facet.field === "preferred_assay_titles"
    );
    const titlesFilters = response.filters.filter(
      (filter) => filter.field === "preferred_assay_titles"
    );
    const slimsFacet = response.facets.find(
      (facet) => facet.field === "preferred_assay_slims"
    );
    const slimsFilters = response.filters.filter(
      (filter) => filter.field === "preferred_assay_slims"
    );

    return {
      props: {
        titlesFacet: titlesFacet ?? null,
        titlesFilters: titlesFilters ?? [],
        slimsFacet: slimsFacet ?? null,
        slimsFilters: slimsFilters ?? [],
      },
    };
  }

  return errorObjectToProps(response);
}
