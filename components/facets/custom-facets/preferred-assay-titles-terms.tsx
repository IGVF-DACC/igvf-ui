// node_modules
import { CheckIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { Fragment } from "react";
// components
import { SelectMenu } from "../../select-menu";
// lib
import {
  getFieldTermsAndFilters,
  isSearchResultsFacetTerms,
} from "../../../lib/search-results";
// local
import StandardTerms from "./standard-terms";
// root
import type {
  SearchResults,
  SearchResultsFacet,
  SearchResultsFacetTerm,
} from "../../../globals";

/**
 * Render the Preferred Assay Titles facet terms, with an optional dropdown for selecting a
 * preferred_assay_slims category when that facet is present in the search results.
 *
 * @param searchResults - Search results from the data provider
 * @param facet - preferred_assay_titles facet object from search results
 * @param updateQuery - Function to update the query string on user selection
 */
export default function PreferredAssayTitlesTerms({
  searchResults,
  facet,
  updateQuery,
}: {
  searchResults: SearchResults;
  facet: SearchResultsFacet;
  updateQuery: (queryString: string) => void;
}) {
  const router = useRouter();

  // Determine the property name for the preferred assay slims facet, because it could be embedded in another property.
  // Search the facets for the first one containing `preferred_assay_slims` in its name, and use that as the property name.
  const slimsFacetPropertyName = searchResults.facets.find((facet) =>
    facet.field.includes("preferred_assay_slims")
  )?.field;
  const titlesFacetPropertyName = searchResults.facets.find((facet) =>
    facet.field.includes("preferred_assay_titles")
  )?.field;

  // Get the list of slims terms from the search-results facet.
  const { terms: slimsTerms, filters: slimsFilters } = getFieldTermsAndFilters(
    slimsFacetPropertyName,
    searchResults
  );
  const selectedSlims = slimsFilters.map((filter) => filter.term);

  // Get the list of preferred assay titles filters from the search-results facet.
  const { filters: titlesFilters } = getFieldTermsAndFilters(
    titlesFacetPropertyName,
    searchResults
  );
  const selectedTitles = titlesFilters.map((filter) => filter.term);

  // Determine the action for the "check all" button. Choose "check-all" if not all preferred assay
  // titles are selected, or "uncheck-all" if all are selected.
  const action: "check-all" | "uncheck-all" =
    facet.terms &&
    isSearchResultsFacetTerms(facet.terms) &&
    facet.terms.length === selectedTitles.length
      ? "uncheck-all"
      : "check-all";

  // Handle a slims term selection click by updating the URL query parameters to reflect the new
  // selection state.
  function onItemClick(value: string, close: () => void) {
    const { [slimsFacetPropertyName]: _removed, ...restQuery } = router.query;
    void router.push({
      pathname: router.pathname,
      query: {
        ...restQuery,
        ...(value !== "none" && { [slimsFacetPropertyName]: value }),
      },
    });
    close();
  }

  // Handle a "check all" click by updating the URL query parameters to include all preferred assay
  // titles in the search results facet for `preferred_assay_titles`.
  function onCheckAllClick(action: "check-all" | "uncheck-all") {
    if (action === "uncheck-all") {
      // Remove all preferred assay titles from the query parameters.
      const { [titlesFacetPropertyName]: _removed, ...restQuery } =
        router.query;
      void router.push({
        pathname: router.pathname,
        query: {
          ...restQuery,
        },
      });
      return;
    }

    // Add all preferred assay titles from the search results facet to the query parameters, along
    // with any existing query parameters.
    const { [titlesFacetPropertyName]: _removed, ...restQuery } = router.query;
    const terms = isSearchResultsFacetTerms(facet.terms) ? facet.terms : [];
    const allTitlesTerms = terms.map((term) => term.key);
    const allTitlesFilters = titlesFilters.map((filter) => filter.term);
    const uniqueTitles = Array.from(
      new Set([...allTitlesTerms, ...allTitlesFilters])
    );
    void router.push({
      pathname: router.pathname,
      query: {
        ...restQuery,
        [titlesFacetPropertyName]: uniqueTitles,
      },
    });
  }

  return (
    <>
      {slimsTerms.length > 0 && (
        <div className="flex flex-col gap-2 px-2 pt-1">
          <PreferredAssaySlimsMenu
            slimsTerms={slimsTerms}
            selectedSlims={selectedSlims}
            onItemClick={(termKey, closeMenu) => {
              onItemClick(termKey, closeMenu);
            }}
          />
          <SelectAllTrigger onCheckAllClick={onCheckAllClick} action={action} />
        </div>
      )}
      <StandardTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    </>
  );
}

/**
 * Display a dropdown menu for the preferred assay slims facet terms, allowing the user to select
 * one of the terms to filter the search results.
 *
 * @param slimsTerms - List of terms for the preferred assay slims facet
 * @param selectedSlims - List of currently selected slims terms
 * @param onItemClick - Callback function to handle item click events, which updates the query
 *                      string and closes the menu
 */
function PreferredAssaySlimsMenu({
  slimsTerms,
  selectedSlims,
  onItemClick,
}: {
  slimsTerms: SearchResultsFacetTerm[];
  selectedSlims: string[];
  onItemClick: (termKey: string, closeMenu: () => void) => void;
}) {
  // Generate the first menu item title of the slims dropdown. If there are selected slims, the
  // title will be "Clear Category" to indicate that clicking it will clear the selection. If no
  // slims are selected, the title will be "Categories" to indicate that the user can select a
  // category. Insert a non-selectable separator between this item and the list of slims.
  const firstMenuTitle =
    selectedSlims.length > 0 ? "Clear Category" : "Categories";
  const terms = [
    { key: "none", key_as_string: firstMenuTitle, doc_count: 0 },
    { key: "__separator__", key_as_string: "", doc_count: 0 },
    ...slimsTerms,
  ];

  return (
    <SelectMenu className="grow">
      {({ close }) => (
        <>
          <SelectMenu.Trigger className="w-full justify-between">
            {selectedSlims.length > 1
              ? "Multiple Categories"
              : (selectedSlims[0] ?? "Categories")}
          </SelectMenu.Trigger>
          <SelectMenu.Items className="[--anchor-max-height:20rem]">
            {terms.map((term) => {
              return (
                <Fragment key={term.key}>
                  {term.key === "__separator__" ? (
                    <SelectMenu.Separator key={term.key} />
                  ) : (
                    <SelectMenu.Item
                      key={term.key}
                      onClick={() => onItemClick(String(term.key), close)}
                    >
                      <div className="flex w-full justify-between gap-4">
                        <div>{term.key_as_string || String(term.key)}</div>
                        <div>{term.doc_count! > 0 ? term.doc_count : ""}</div>
                      </div>
                    </SelectMenu.Item>
                  )}
                </Fragment>
              );
            })}
          </SelectMenu.Items>
        </>
      )}
    </SelectMenu>
  );
}

/**
 * Render a button that allows the user to select all preferred assay titles.
 *
 * @param onCheckAllClick - Callback function to handle the "check all" button click event
 */
function SelectAllTrigger({
  onCheckAllClick,
  action,
}: {
  onCheckAllClick: (action: "check-all" | "uncheck-all") => void;
  action: "check-all" | "uncheck-all";
}) {
  return (
    <button
      onClick={() => onCheckAllClick(action)}
      className="flex w-fit cursor-pointer items-center gap-0.5 rounded-sm px-2 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <CheckIcon className="h-4 w-4" />
      {action === "check-all" ? "Check All" : "Uncheck All"}
    </button>
  );
}
