// node_modules
import { AnimatePresence, motion } from "framer-motion";
import {
  Bars4Icon,
  MinusIcon,
  PlusIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { Fragment, useContext, useEffect, useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../components/animation";
import { Button, ButtonLink } from "../components/form-elements";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import {
  getAccessoryData,
  getSearchListItemRenderer,
  SearchListItem,
} from "../components/search";
import SessionContext from "../components/session-context";
// lib
import { UC } from "../lib/constants";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { toShishkebabCase } from "../lib/general";
import QueryString from "../lib/query-string";

function getTypeTitle(searchResult, collectionTitles) {
  return collectionTitles?.[searchResult.key] || searchResult.key;
}

/**
 * Displays the header for a single type's top hits.
 */
function TypeSectionHeader({
  searchResult,
  isSectionOpen,
  onSectionOpenClick,
}) {
  const { collectionTitles } = useContext(SessionContext);

  // Get the section title for the top-hits type.
  const typeTitle = getTypeTitle(searchResult, collectionTitles);

  return (
    <div
      className={`flex justify-between border-data-border bg-site-search-header py-1 px-2${
        isSectionOpen ? " border-b" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onSectionOpenClick(searchResult.key)}
          type="secondary"
          size="sm"
          hasIconOnly
          label={`${
            isSectionOpen ? "Collapse" : "Expand"
          } top matches for ${typeTitle}`}
        >
          {isSectionOpen ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </Button>
        <div className="@md:flex @md:items-baseline @md:gap-2">
          <div className="text-lg font-semibold leading-5">{typeTitle}</div>
          <div className="text-base leading-4 text-gray-600 @md:text-xs dark:text-gray-300">
            {searchResult.doc_count} item
            {searchResult.doc_count === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </div>
  );
}

TypeSectionHeader.propTypes = {
  // Search results for a single type
  searchResult: PropTypes.shape({
    // Search result type
    key: PropTypes.string.isRequired,
    // Total number of matches for the type
    doc_count: PropTypes.number.isRequired,
  }),
  // True if the trigger should show the section is open
  isSectionOpen: PropTypes.bool.isRequired,
  // Call to toggle the open state of the section
  onSectionOpenClick: PropTypes.func.isRequired,
};

/**
 * Display the footer for a single type's top hits. This includes links to the list and report views
 * for all results matching the user's query.
 */
function TypeSectionFooter({ searchResult, term }) {
  const { collectionTitles } = useContext(SessionContext);
  const typeTitle = getTypeTitle(searchResult, collectionTitles);

  // Build a query for the list and report views for the top-hits search type.
  const query = new QueryString();
  query.addKeyValue("type", searchResult.key);
  query.addKeyValue("query", term);

  return (
    <div className="flex items-center justify-end gap-2 pb-1 pl-1 pr-1 pt-0.5">
      <div className="text-xs text-gray-500">
        View all {searchResult.doc_count} {typeTitle} with {UC.ldquo}
        {term}
        {UC.rdquo}
      </div>
      <div className="flex gap-1">
        <ButtonLink
          href={`/search?${query.format()}`}
          type="primary"
          label={`View search list for ${typeTitle} with ${term}`}
          hasIconOnly
        >
          <Bars4Icon className="h-4 w-4" />
        </ButtonLink>
        <ButtonLink
          href={`/multireport?${query.format()}`}
          type="primary"
          label={`View search report for ${typeTitle} with ${term}`}
          hasIconOnly
        >
          <TableCellsIcon className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
  );
}

TypeSectionFooter.propTypes = {
  // Search results for a single type
  searchResult: PropTypes.shape({
    // Search result type
    key: PropTypes.string.isRequired,
    // Total number of matches for the type
    doc_count: PropTypes.number.isRequired,
  }),
  // Term leading to these top-hit results
  term: PropTypes.string.isRequired,
};

/**
 * Display the top-hits results for one `@type` of query results.
 */
function TypeSection({ type, children }) {
  return (
    <li
      className="my-4 border border-data-border bg-panel @container first:mt-0 last:mb-0"
      data-testid={`site-search-type-section-${toShishkebabCase(type)}`}
    >
      {children}
    </li>
  );
}

TypeSection.propTypes = {
  // Object type for this section of search results
  type: PropTypes.string.isRequired,
};

/**
 * Displays the list of top hits for a single type.
 */
function TypeTopHits({ topHits, children }) {
  return (
    <ul className="p-0.5">
      {topHits.map((hit) => (
        <Fragment key={hit._id}>{children(hit._source.embedded)}</Fragment>
      ))}
    </ul>
  );
}

TypeTopHits.propTypes = {
  // Top hits results
  topHits: PropTypes.array.isRequired,
};

export default function SiteSearch({ results, term, accessoryData = null }) {
  // Tracks the keys of opened type sections
  const [openedSections, setOpenedSections] = useState([]);
  const { collectionTitles } = useContext(SessionContext);

  function onSectionOpenClick(sectionKey) {
    if (openedSections.includes(sectionKey)) {
      setOpenedSections(
        openedSections.filter((section) => section !== sectionKey)
      );
    } else {
      setOpenedSections(openedSections.concat(sectionKey));
    }
  }

  // Close all the type sections if the search term changes.
  useEffect(() => {
    setOpenedSections([]);
  }, [term]);

  return (
    <>
      <PagePreamble />
      {results.length > 0 ? (
        <ul>
          {results.map((result) => {
            const isSectionOpen = openedSections.includes(result.key);
            const typeTitle = getTypeTitle(result, collectionTitles);
            return (
              <TypeSection type={result.key} key={result.key}>
                <TypeSectionHeader
                  searchResult={result}
                  isSectionOpen={isSectionOpen}
                  onSectionOpenClick={onSectionOpenClick}
                />
                <AnimatePresence>
                  {isSectionOpen && (
                    <motion.div
                      className="overflow-hidden bg-gray-100 text-sm leading-relaxed dark:bg-gray-900"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      transition={standardAnimationTransition}
                      variants={standardAnimationVariants}
                    >
                      <div className="px-1 pt-0.5 text-center text-xs font-semibold uppercase text-gray-500">
                        Top results for {typeTitle}
                      </div>
                      <TypeTopHits topHits={result.top_hits.hits.hits}>
                        {(item) => {
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
                        }}
                      </TypeTopHits>
                      <TypeSectionFooter searchResult={result} term={term} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TypeSection>
            );
          })}
        </ul>
      ) : (
        <NoCollectionData pageTitle="matching items" />
      )}
    </>
  );
}

SiteSearch.propTypes = {
  // Top-hits search result buckets
  results: PropTypes.array.isRequired,
  // Search term leading to these results
  term: PropTypes.string.isRequired,
  // Accessory data for search results, keyed by each object's `@id`
  accessoryData: PropTypes.object,
};

/**
 * Generate lists of top-hits result items by item type, generating an object with each item type in
 * the search results as keys. Under each key is an array of search-result items of that type, i.e.:
 * ```
 * {
 *   "PrimaryCell": [primary-cell-item-1, primary-cell-item-2, primary-cell-item-3],
 *   "Tissue": [tissue-item-1, tissue-item-2],
 * }
 * ```
 * @param {object} topHitsResults Search results from igvfd
 * @returns {object} Object with item types as keys and arrays of search-result items as values
 */
function getTopHitsItemListsByType(topHitsResults) {
  const buckets = topHitsResults.aggregations.types.types.buckets;
  const list = {};
  buckets.forEach((bucket) => {
    list[bucket.key] = bucket.top_hits.hits.hits.map(
      (hit) => hit._source.embedded
    );
  });
  return list;
}

export async function getServerSideProps({ req, query }) {
  // Accept a single "term=" query-string parameter.
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const term = query.term;
  const topHitsResults = (
    await request.getObject(`/top-hits-raw?query=${term}`)
  ).union();
  if (FetchRequest.isResponseSuccess(topHitsResults)) {
    const itemListsByType = getTopHitsItemListsByType(topHitsResults);
    const accessoryData = await getAccessoryData(
      itemListsByType,
      req.headers.cookie
    );
    return {
      props: {
        results: topHitsResults.aggregations.types.types.buckets,
        accessoryData,
        term,
        pageContext: { title: `Items with ${UC.ldquo}${term}${UC.rdquo}` },
      },
    };
  }
  return errorObjectToProps(topHitsResults);
}
