// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import Breadcrumbs from "../components/breadcrumbs";
import { FacetSection, FacetTags } from "../components/facets";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import {
  getAccessoryData,
  getItemListsByType,
  getSearchListItemRenderer,
  SearchListItem,
} from "../components/search";
import { SearchPager, useSearchLimits } from "../components/search-results";
import { SearchResultsHeader } from "../components/search-results";
import SessionContext from "../components/session-context";
import TableCount from "../components/table-count";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { getQueryStringFromServerQuery } from "../lib/query-utils";
import {
  generateSearchResultsTypes,
  stripLimitQueryIfNeeded,
} from "../lib/search-results";

/**
 * Displays all /search pages. These display a list of results from a search query. Most of the
 * components this relies on use the term, "search list," to distinguish it from other kinds of
 * search-result display pages, such as /report.
 */
export default function Search({ searchResults, accessoryData = null }) {
  const { collectionTitles, profiles } = useContext(SessionContext);
  const { totalPages } = useSearchLimits(searchResults);
  const resultTypes = generateSearchResultsTypes(
    searchResults,
    profiles,
    collectionTitles
  );

  return (
    <>
      <Breadcrumbs item={searchResults} />
      {resultTypes.length > 0 && (
        <PagePreamble
          pageTitle={
            resultTypes.length > 3
              ? `${resultTypes.slice(0, 3).join(", ")}...`
              : resultTypes.join(", ")
          }
        />
      )}
      <div className="lg:flex lg:items-start lg:gap-1">
        <FacetSection searchResults={searchResults} />
        <div className="grow">
          <FacetTags searchResults={searchResults} />
          {searchResults.total > 0 ? (
            <>
              <SearchResultsHeader searchResults={searchResults} />
              <TableCount count={searchResults.total} />
              {totalPages > 1 && <SearchPager searchResults={searchResults} />}
              <ul data-testid="search-list">
                {searchResults["@graph"].map((item) => {
                  // For each item, get the appropriate search-list item renderer for it, or the
                  // fallback render if the item type doesn't have one.
                  const SearchListItemRenderer =
                    getSearchListItemRenderer(item);
                  return (
                    <SearchListItem
                      key={item["@id"]}
                      testid={item["@id"]}
                      href={item["@id"]}
                    >
                      <SearchListItemRenderer
                        item={item}
                        accessoryData={accessoryData}
                      />
                    </SearchListItem>
                  );
                })}
              </ul>
            </>
          ) : (
            <NoCollectionData pageTitle="list items" />
          )}
        </div>
      </div>
    </>
  );
}

Search.propTypes = {
  // /search results from igvfd
  searchResults: PropTypes.object.isRequired,
  // Accessory data for search results, keyed by each object's `@id`
  accessoryData: PropTypes.object,
};

export async function getServerSideProps({ req, query }) {
  // if the limit= query parameter exists, redirect to this page without it if its value is > 1000
  // or if it has more than one value.
  const limitlessRedirect = stripLimitQueryIfNeeded(query);
  if (limitlessRedirect) {
    return {
      redirect: {
        destination: `/search/?${limitlessRedirect}`,
        permanent: true,
      },
    };
  }

  const request = new FetchRequest({ cookie: req.headers.cookie });
  const queryParams = getQueryStringFromServerQuery(query);
  const searchResults = (
    await request.getObject(`/search/?${queryParams}`)
  ).union();

  if (FetchRequest.isResponseSuccess(searchResults)) {
    const itemListsByType = getItemListsByType(searchResults);
    const accessoryData = await getAccessoryData(
      itemListsByType,
      req.headers.cookie
    );
    return {
      props: {
        searchResults,
        accessoryData,
      },
    };
  }
  return errorObjectToProps(searchResults);
}
