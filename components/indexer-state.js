// node_modules
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
// components
import GlobalContext from "./global-context";
import SessionContext from "./session-context";
import { TooltipRef } from "./tooltip";
// lib
import FetchRequest from "../lib/fetch-request";

/**
 * Interval in milliseconds to request the indexer state from the data provider.
 */
const INDEXER_STATE_REQUEST_INTERVAL = 300_000;

/**
 * Duration in milliseconds to display the indexer state request indicator.
 */
const INDEXER_STATE_REQUEST_INDICATOR_DURATION = 500;

/**
 * Use these constants to specify the styles of the indexer-state badge.
 */
const INDEXER_STYLE_INDEXED = "INDEXED";
const INDEXER_STYLE_INDEXING = "INDEXING";

/**
 * Tailwind CSS styles for the indexer-state badge for both the indexing and indexed states.
 */
const indexerStyles = {
  INDEXED:
    "[&_#indexer-background]:bg-indexed-state [&_#indexer-outline]:border-indexed-state [&_#indexer-outline]:bg-none text-indexed-state [&_#indexer-icon]:fill-indexed-state",
  INDEXING:
    "[&_#indexer-background]:bg-indexing-state [&_#indexer-outline]:border-indexing-state [&_#indexer-outline]:bg-none text-indexing-state [&_#indexer-icon]:fill-indexing-state",
};

/**
 * Abbreviate a number to a string with an order-of-magnitude suffix (e.g. 1000 => 1K). Works well
 * for numbers less than 1 trillion.
 * @param {number} number The number to abbreviate
 * @returns {string} The abbreviated number
 */
function abbreviateNumber(number) {
  // Round to the nearest tenth if two digits or less, otherwise round to the nearest whole.
  function toTenthOrWhole(hundredsOf) {
    return hundredsOf.toFixed(hundredsOf < 100 ? 1 : 0);
  }

  if (number >= 1_000_000_000) {
    const hundredsOf = number / 1_000_000_000;
    return `${toTenthOrWhole(hundredsOf)}B`;
  }
  if (number >= 1_000_000) {
    const hundredsOf = number / 1_000_000;
    return `${toTenthOrWhole(hundredsOf)}M`;
  }
  if (number >= 1000) {
    const hundredsOf = number / 1000;
    return `${toTenthOrWhole(hundredsOf)}K`;
  }
  return number;
}

/**
 * Display the icon within the indexing-state badge that indicates that an indexer-state request
 * has been triggered.
 */
function RequestingIcon() {
  return (
    <ArrowPathIcon
      id="indexer-icon"
      data-testid="indexer-requesting-icon"
      className={`h-full fill-white [&>path]:origin-center [&>path]:animate-[spin_2s_infinite_linear]`}
    />
  );
}

/**
 * Display the current indexer state badge for the navigation area when the user has expanded it.
 */
function IndexerStateExpanded({
  isRequesting,
  isIndexing,
  indexingCount,
  isAdmin,
  onClick,
  indexerStateTooltip,
}) {
  const indexerStyle = isIndexing
    ? INDEXER_STYLE_INDEXING
    : INDEXER_STYLE_INDEXED;

  return (
    <div
      data-testid="indexer-state-expanded"
      className={`mt-2 flex items-center justify-center border-t border-gray-200 p-4 dark:border-gray-700 ${indexerStyles[indexerStyle]}`}
    >
      <TooltipRef tooltipAttr={indexerStateTooltip}>
        <button
          id="indexer-outline"
          className={`h-5 w-2/3 rounded-full border p-px ${
            isAdmin ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={isAdmin ? onClick : null}
          data-testid="indexer-state-button"
        >
          <div
            id="indexer-background"
            className="flex h-full w-full items-center justify-center rounded-full text-[0.6rem] font-bold"
          >
            {isRequesting ? (
              <RequestingIcon />
            ) : (
              <>
                {isIndexing ? (
                  <>INDEXING {abbreviateNumber(indexingCount)}</>
                ) : (
                  "INDEXED"
                )}
              </>
            )}
          </div>
        </button>
      </TooltipRef>
    </div>
  );
}

IndexerStateExpanded.propTypes = {
  // True if an indexer-state request has been triggered
  isRequesting: PropTypes.bool.isRequired,
  // True if the indexer is currently indexing
  isIndexing: PropTypes.bool.isRequired,
  // Number of objects left to index if `isIndexing` is true
  indexingCount: PropTypes.number.isRequired,
  // True if user has logged in as an admin
  isAdmin: PropTypes.bool.isRequired,
  // Function to call when the user clicks the indexer-state badge
  onClick: PropTypes.func.isRequired,
  // Tooltip attributes for the indexer-state badge
  indexerStateTooltip: PropTypes.object.isRequired,
};

/**
 * Display the current indexer state badge for the navigation area when the user has collapsed it.
 */
function IndexerStateCollapsed({
  isRequesting,
  isIndexing,
  indexingCount,
  isAdmin,
  onClick,
  indexerStateTooltip,
}) {
  const indexerStyle = isIndexing
    ? INDEXER_STYLE_INDEXING
    : INDEXER_STYLE_INDEXED;

  return (
    <div
      data-testid="indexer-state-collapsed"
      className={`my-2 ${indexerStyles[indexerStyle]}`}
    >
      <TooltipRef tooltipAttr={indexerStateTooltip}>
        <button
          id="indexer-outline"
          className={`mx-auto h-8 w-8 rounded-full border p-px ${
            isAdmin ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={isAdmin ? onClick : null}
          data-testid="indexer-state-button"
        >
          <div
            id="indexer-background"
            className="flex h-full w-full items-center justify-center rounded-full p-2 text-[0.45rem] font-bold"
          >
            {isRequesting ? (
              <RequestingIcon />
            ) : (
              <>
                {isIndexing ? (
                  <>{abbreviateNumber(indexingCount)}</>
                ) : (
                  <CheckIcon
                    data-testid="indexer-state-indexed-icon"
                    className="h-full w-full fill-white"
                  />
                )}
              </>
            )}
          </div>
        </button>
      </TooltipRef>
    </div>
  );
}

IndexerStateCollapsed.propTypes = {
  // True if an indexer-state request has been triggered
  isRequesting: PropTypes.bool.isRequired,
  // True if the indexer is currently indexing
  isIndexing: PropTypes.bool.isRequired,
  // Number of objects left to index if `isIndexing` is true
  indexingCount: PropTypes.number.isRequired,
  // True if user has logged in as an admin
  isAdmin: PropTypes.bool.isRequired,
  // Function to call when the user clicks the indexer-state badge
  onClick: PropTypes.func.isRequired,
  // Tooltip attributes for the indexer-state badge
  indexerStateTooltip: PropTypes.object.isRequired,
};

/**
 * Display the current indexer state badge. This handles the cases where the user has expanded or
 * collapsed the navigation area. The indexer-state badge tooltip gets created in the `<Site>`
 * component and placed into `GlobalContext` because creating the tooltip here causes the
 * scrollable navigation parent component to limit the width of -- and even clip -- the tooltip.
 */
export default function IndexerState({ isCollapsed = false }) {
  const { sessionProperties } = useContext(SessionContext);
  const { indexerStateTooltip } = useContext(GlobalContext);
  const isAdmin = !!sessionProperties?.admin;
  const request = new FetchRequest({ backend: true });

  // Current indexer state based on the /indexer-state endpoint data
  const [isIndexing, setIsIndexing] = useState(false);
  // Number of objects left to index
  const [indexingCount, setIndexingCount] = useState(0);
  // True if an indexer-state request has been triggered
  const [isRequesting, setIsRequesting] = useState(false);

  // Request the current indexer state from the data provider.
  async function requestIndexerState() {
    const indexerState = (
      await request.getObject("/api/indexer-state/")
    ).optional();
    if (indexerState) {
      setIsIndexing(indexerState.isIndexing);
      setIndexingCount(indexerState.indexingCount);
    }
  }

  // Trigger an indexer-state request and show the indexer-state request indicator.
  function triggerIndexerStateRequest() {
    // When requesting the indexer state, show an indicator for a short time.
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
    }, INDEXER_STATE_REQUEST_INDICATOR_DURATION);

    // Perform the periodic request to get the current indexer state.
    requestIndexerState();
  }

  useEffect(() => {
    // Poll the indexer state so that the indexer-state icon updates when the indexer starts or
    // finishes, and shows a momentary display as each request initiates. Also make this request on
    // page load so that the icon is up-to-date when the page loads.
    requestIndexerState();
    const interval = setInterval(() => {
      triggerIndexerStateRequest();
    }, INDEXER_STATE_REQUEST_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Render an SVG circle with a radius of 26px and a blue fill
  return (
    <>
      {isCollapsed ? (
        <IndexerStateCollapsed
          isRequesting={isRequesting}
          isIndexing={isIndexing}
          indexingCount={indexingCount}
          isAdmin={isAdmin}
          onClick={triggerIndexerStateRequest}
          indexerStateTooltip={indexerStateTooltip}
        />
      ) : (
        <IndexerStateExpanded
          isRequesting={isRequesting}
          isIndexing={isIndexing}
          indexingCount={indexingCount}
          isAdmin={isAdmin}
          onClick={triggerIndexerStateRequest}
          indexerStateTooltip={indexerStateTooltip}
        />
      )}
    </>
  );
}

IndexerState.propTypes = {
  // True if the indexer-state is within the collapsed navigation area
  isCollapsed: PropTypes.bool,
};
