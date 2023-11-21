// node_modules
import _ from "lodash";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React, { useContext, useRef } from "react";
// components
import Breadcrumbs from "../components/breadcrumbs";
import { DataGridContainer } from "../components/data-grid";
import { FacetSection, FacetTags } from "../components/facets";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import {
  generateColumns,
  ReportHeaderCell,
  ScrollIndicators,
} from "../components/report/";
import { SearchPager, useSearchLimits } from "../components/search-results";
import {
  SearchResultsCount,
  SearchResultsHeader,
} from "../components/search-results";
import SessionContext from "../components/session-context";
import SortableGrid from "../components/sortable-grid";
// lib
import buildBreadcrumbs from "../lib/breadcrumbs";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import QueryString from "../lib/query-string";
import {
  splitPathAndQueryString,
  getQueryStringFromServerQuery,
} from "../lib/query-utils";
import {
  columnsToColumnSpecs,
  getMergedSchemaProperties,
  getReportTypeColumnSpecs,
  getSchemasForReportTypes,
  getSelectedTypes,
  getSortColumn,
} from "../lib/report";
import {
  composeSearchResultsPageTitle,
  stripLimitQueryIfNeeded,
} from "../lib/search-results";

/**
 * Update the given query string to show or hide a column.
 * @param {string} queryString Current search query string
 * @param {string} columnId Column ID to add or remove from the query string
 * @param {boolean} isVisible True if the column for `columnId` is now visible
 * @param {array} defaultColumnSpecs Column specs for the default columns of the report's schema
 * @returns {string} `queryString` with the `columnId` column added or removed
 */
function updateColumnVisibilityQuery(
  queryString,
  columnId,
  isVisible,
  defaultColumnSpecs
) {
  const query = new QueryString(queryString);
  const hasSpecificFields = query.getKeyValues("field").length > 0;
  const defaultColumnIds = defaultColumnSpecs.map(
    (columnSpec) => columnSpec.id
  );

  // To prepare the query string for adding or removing a "field=" parameter, convert any query
  // string that doesn't have any "field=" parameters into one that has all the default columns as
  // "field=" parameters.
  if (!hasSpecificFields) {
    defaultColumnIds.forEach((columnId) => {
      query.addKeyValue("field", columnId);
    });
  }

  if (isVisible) {
    query.deleteKeyValue("field", columnId);
  } else {
    query.addKeyValue("field", columnId);
  }

  // In case the user manually entered a query string with no "field=@id" parameter, add it.
  if (!query.getKeyValues("field").includes("@id")) {
    query.addKeyValue("field", "@id");
  }

  // Get all the resulting "field=" parameters and compare them to the default columns. If they
  // match, remove the "field=" parameters from the query string to display only the default
  // columns.
  const fieldValues = query.getKeyValues("field");
  const isFieldsMatchDefaultColumns = _.isEqual(
    _.sortBy(fieldValues),
    _.sortBy(defaultColumnIds)
  );
  if (isFieldsMatchDefaultColumns) {
    query.deleteKeyValue("field");
  }

  return query.format();
}

/**
 * Update the given query string to show or hide all columns. When hiding all columns, the `@id`
 * column remains visible.
 * @param {string} queryString MultiReport query string to update
 * @param {boolean} isAllVisible True to make all possible columns visible, false to hide all
 * @param {array} allColumnSpecs All possible columns for the current report type
 * @returns
 */
function updateAllColumnsVisibilityQuery(
  queryString,
  isAllVisible,
  allColumnSpecs
) {
  const query = new QueryString(queryString);
  if (isAllVisible) {
    // Set fields for all possible report columns for the current type
    const columnIds = allColumnSpecs.map((column) => column.id);
    query.deleteKeyValue("field");
    columnIds.forEach((columnId) => {
      query.addKeyValue("field", columnId);
    });
  } else {
    // Remove all fields except the `@id` column
    query.deleteKeyValue("field");
    query.addKeyValue("field", "@id");
  }
  return query.format();
}

export default function MultiReport({ searchResults }) {
  const router = useRouter();
  const { collectionTitles, profiles } = useContext(SessionContext);
  const { totalPages } = useSearchLimits(searchResults);

  // Ref of the scrollable table DOM <div> so we can detect scroll position
  const gridRef = useRef(null);

  const { path, queryString } = splitPathAndQueryString(searchResults["@id"]);
  const sortedColumnId = getSortColumn(searchResults);
  const nonSortableColumnIds = searchResults.non_sortable || [];
  const selectedTypes = getSelectedTypes(searchResults);

  // Get all schemas for the selected report types and merge their properties into a single schema-
  // like object.
  const schemas = getSchemasForReportTypes(selectedTypes, profiles);
  const schemaProperties = getMergedSchemaProperties(schemas);

  // Get the search result default column specs as well as all possible column specs for the
  // selected report types.
  const defaultColumnSpecs = columnsToColumnSpecs(searchResults.columns);
  const visibleColumnSpecs = columnsToColumnSpecs(searchResults.result_columns);
  const allColumnSpecs = getReportTypeColumnSpecs(selectedTypes, profiles);

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
      allColumnSpecs
    );
    router.push(`${path}?${updatedQueryString}`);
  }

  if (schemaProperties) {
    const pageTitle = composeSearchResultsPageTitle(
      searchResults,
      collectionTitles
    );
    const items = searchResults["@graph"];
    const columns = generateColumns(
      selectedTypes,
      visibleColumnSpecs,
      schemaProperties
    );

    return (
      <>
        <Breadcrumbs />
        {pageTitle && <PagePreamble pageTitle={pageTitle} />}
        {items.length > 0 ? (
          <div className="lg:flex lg:items-start lg:gap-1">
            <FacetSection searchResults={searchResults} />
            <div className="min-w-0 grow">
              <FacetTags searchResults={searchResults} />
              <SearchResultsHeader
                searchResults={searchResults}
                reportViewExtras={{
                  allColumnSpecs,
                  visibleColumnSpecs,
                  onColumnVisibilityChange,
                  onAllColumnsVisibilityChange,
                }}
              />
              <SearchResultsCount count={searchResults.total} />
              {totalPages > 1 && <SearchPager searchResults={searchResults} />}
              <ScrollIndicators gridRef={gridRef}>
                <DataGridContainer ref={gridRef}>
                  <SortableGrid
                    data={items}
                    columns={columns}
                    initialSort={{ isSortingSuppressed: true }}
                    meta={{
                      onHeaderCellClick,
                      sortedColumnId,
                      nonSortableColumnIds,
                    }}
                    CustomHeaderCell={ReportHeaderCell}
                  />
                </DataGridContainer>
              </ScrollIndicators>
            </div>
          </div>
        ) : (
          <NoCollectionData pageTitle="report items" />
        )}
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
    const breadcrumbs = await buildBreadcrumbs(
      searchResults,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        searchResults,
        pageContext: { title: "title" },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(searchResults);
}
