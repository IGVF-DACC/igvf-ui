// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import _ from "lodash";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React, { useContext } from "react";
// components
import Breadcrumbs from "../components/breadcrumbs";
import { FacetSection, FacetTags } from "../components/facets";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import { generateColumns, ReportHeaderCell } from "../components/report/";
import { SearchPager, useSearchLimits } from "../components/search-results";
import { SearchResultsHeader } from "../components/search-results";
import SessionContext from "../components/session-context";
import SortableGrid from "../components/sortable-grid";
import TableCount from "../components/table-count";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import QueryString from "../lib/query-string";
import {
  splitPathAndQueryString,
  getQueryStringFromServerQuery,
} from "../lib/query-utils";
import {
  columnsToColumnSpecs,
  columnsToNormalAndAuditColumns,
  getAllAuditColumnIds,
  getAuditColumnSpecs,
  getMergedSchemaProperties,
  getReportTypeColumnSpecs,
  getSchemasForReportTypes,
  getSelectedTypes,
  getSortColumn,
  mergeColumnSpecs,
  updateAllColumnsVisibilityQuery,
  updateColumnVisibilityQuery,
} from "../lib/report";
import {
  generateSearchResultsTypes,
  stripLimitQueryIfNeeded,
} from "../lib/search-results";

export default function MultiReport({ searchResults }) {
  const { isAuthenticated } = useAuth0();
  const router = useRouter();
  const { collectionTitles, profiles } = useContext(SessionContext);
  const { totalPages } = useSearchLimits(searchResults);

  const { path, queryString } = splitPathAndQueryString(searchResults["@id"]);
  const sortedColumnId = getSortColumn(searchResults);
  const auditColumnSpecs = getAuditColumnSpecs(isAuthenticated);
  const allAuditColumnIds = getAllAuditColumnIds(auditColumnSpecs);
  const nonSortableColumnIds = (searchResults.non_sortable || []).concat(
    allAuditColumnIds
  );
  const selectedTypes = getSelectedTypes(searchResults);

  // Get all schemas for the selected report types and merge their properties into a single schema-
  // like object.
  const schemas = getSchemasForReportTypes(selectedTypes, profiles);
  const schemaProperties = getMergedSchemaProperties(schemas);

  // Get the search result default column specs for the schema(s) so we know when not to include
  // any `field=` in the query string.
  const defaultColumnSpecs = columnsToColumnSpecs(searchResults.columns);

  // Split `result_columns` into visible non-audit columns and visible audit columns.
  const { visibleColumns, visibleAuditColumns } =
    columnsToNormalAndAuditColumns(searchResults.result_columns);
  const visibleColumnSpecs = columnsToColumnSpecs(visibleColumns);
  const visibleAuditColumnSpecs = columnsToColumnSpecs(visibleAuditColumns);

  let allColumnSpecs = getReportTypeColumnSpecs(selectedTypes, profiles);
  allColumnSpecs = mergeColumnSpecs(allColumnSpecs, visibleColumnSpecs);

  /**
   * Navigate to the same page but with the "sort=" query parameter set to the column that was
   * clicked. This also handles reverse sorting when the user clicks on the currently sorted
   * column.
   * @param {string} columnId Property name of the column that was clicked
   */
  function onHeaderCellClick(columnId) {
    const query = new QueryString(queryString);
    const newSortColumn =
      columnId === sortedColumnId ? `-${columnId}` : columnId;
    query.replaceKeyValue("sort", newSortColumn);
    router.push(`${path}?${query.format()}`);
  }

  /**
   * Called when the user clicks an individual column's visibility toggle in the modal. Depending
   * on the current state of the "field=" query parameter, this function will either add or remove
   * the column's property name from the query string.
   * @param {string} columnId ID of the column the user made visible or invisible in the modal
   * @param {boolean} isVisible True if the column is now visible, false if it is now invisible
   */
  function onColumnVisibilityChange(columnId, isVisible) {
    const updatedQueryString = updateColumnVisibilityQuery(
      queryString,
      columnId,
      isVisible,
      defaultColumnSpecs
    );
    router.push(`${path}?${updatedQueryString}`);
  }

  /**
   * Called when the user chooses to hide or show all columns in the modal at once. When hiding all
   * columns, the `@id` column remains visible.
   * @param {boolean} isAllVisible True to make all possible columns visible, false to hide all
   */
  function onAllColumnsVisibilityChange(isAllVisible) {
    const updatedQueryString = updateAllColumnsVisibilityQuery(
      queryString,
      isAllVisible,
      allColumnSpecs,
      visibleColumnSpecs
    );
    router.push(`${path}?${updatedQueryString}`);
  }

  if (schemaProperties) {
    const resultTypes = generateSearchResultsTypes(
      searchResults,
      profiles,
      collectionTitles
    );
    const items = searchResults["@graph"];
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      visibleAuditColumnSpecs,
      schemaProperties
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
          <div className="min-w-0 grow">
            {items.length > 0 ? (
              <>
                <FacetTags searchResults={searchResults} />
                <SearchResultsHeader
                  searchResults={searchResults}
                  reportViewExtras={{
                    allColumnSpecs,
                    auditColumnSpecs,
                    visibleColumnSpecs,
                    visibleAuditColumnSpecs,
                    onColumnVisibilityChange,
                    onAllColumnsVisibilityChange,
                  }}
                />
                <TableCount count={searchResults.total} />
                {totalPages > 1 && (
                  <SearchPager searchResults={searchResults} />
                )}
                <SortableGrid
                  data={items}
                  columns={columns}
                  initialSort={{ isSortingSuppressed: true }}
                  meta={{
                    onHeaderCellClick,
                    sortedColumnId,
                    nonSortableColumnIds,
                  }}
                  isTotalCountHidden
                  CustomHeaderCell={ReportHeaderCell}
                />
              </>
            ) : (
              <NoCollectionData pageTitle="report items" />
            )}
          </div>
        </div>
      </>
    );
  }
  return null;
}

MultiReport.propTypes = {
  // @graph from search results from igvfd
  searchResults: PropTypes.object.isRequired,
};

export async function getServerSideProps({ req, query }) {
  // if the limit= query parameter exists, redirect to this page without it if its value is > 1000
  // or if it has more than one value.
  const limitlessRedirect = stripLimitQueryIfNeeded(query);
  if (limitlessRedirect) {
    return {
      redirect: {
        destination: `/multireport/?${limitlessRedirect}`,
        permanent: true,
      },
    };
  }

  const request = new FetchRequest({ cookie: req.headers.cookie });
  const queryParams = getQueryStringFromServerQuery(query);
  const searchResults = (
    await request.getObject(`/multireport/?${queryParams}`)
  ).union();

  if (FetchRequest.isResponseSuccess(searchResults)) {
    return {
      props: {
        searchResults,
      },
    };
  }
  return errorObjectToProps(searchResults);
}
