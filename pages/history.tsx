// node_modules
import { AnimatePresence, motion } from "framer-motion";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { type MouseEvent, useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../components/animation";
import { DataPanel } from "../components/data-area";
import { HistoryLink } from "../components/history-link";
import JsonPanel from "../components/json-panel";
import PagePreamble from "../components/page-preamble";
// lib
import { formatDate } from "../lib/dates";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { sortObjectProps } from "../lib/general";
import {
  type HistoryEntry,
  type HistoryObject,
  jsonLineDiff,
} from "../lib/history";

/**
 * Display a header for the history page that's similar to ObjectPageHeader but usable with the
 * history object.
 * @param history - History object for a database object
 */
function PageHeader({ history }: { history: HistoryObject }) {
  return (
    <div className="flex items-end justify-end gap-1">
      <HistoryLink basePath={history.rid} />
    </div>
  );
}

/**
 * Display the title of a history entry.
 * @param entry - History entry object containing details of the change
 * @param isExpanded - Whether the history entry is expanded
 * @param onExpandClick - Function to call when the expand button is clicked
 */
function Title({
  entry,
  isExpanded,
  onExpandClick,
}: {
  entry: HistoryEntry;
  isExpanded: boolean;
  onExpandClick: (e: MouseEvent<HTMLButtonElement>, id: string) => void;
}) {
  const historyDate = formatDate(entry.timestamp, "show-time");

  return (
    <div className="flex justify-between px-2 py-1">
      <button
        onClick={(e) => onExpandClick(e, entry.timestamp)}
        className="flex items-center gap-2 font-semibold"
        aria-expanded={isExpanded}
        aria-label={`Object history on ${historyDate}`}
      >
        {isExpanded ? (
          <MinusIcon className="h-4 w-4" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
        {historyDate}
      </button>
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
        {entry.user_from_access_key || entry.userid || "unknown user"}
      </div>
    </div>
  );
}

/**
 * Display one history entry's panel.
 * @param entry - One element from history object `history` property
 * @param previousEntry - The previous history entry, used to generate the diff
 * @param onExpandClick - Function to call when the expand button is clicked
 * @param isPanelExpanded - Whether the history entry is expanded
 */
function Entry({
  entry,
  previousEntry = null,
  onExpandClick,
  isPanelExpanded,
}: {
  entry: HistoryEntry;
  previousEntry?: HistoryEntry;
  onExpandClick: (e: MouseEvent<HTMLButtonElement>, id: string) => void;
  isPanelExpanded: boolean;
}) {
  // Generate a list of changes between the previous and current history entries.
  let diffLines = [];
  const entryJson = JSON.stringify(sortObjectProps(entry.props), null, 2);
  if (previousEntry) {
    diffLines = jsonLineDiff(
      JSON.stringify(sortObjectProps(previousEntry.props), null, 2),
      entryJson
    );
  }

  return (
    <DataPanel className="my-2" isPaddingSuppressed>
      <div
        className="bg-gray-200 dark:bg-gray-700"
        data-testid={`history-entry-${entry.timestamp}`}
      >
        <Title
          entry={entry}
          isExpanded={isPanelExpanded}
          onExpandClick={onExpandClick}
        />
        <AnimatePresence>
          {isPanelExpanded && (
            <motion.div
              className="overflow-hidden pr-2 pb-2 pl-2"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              transition={standardAnimationTransition}
              variants={standardAnimationVariants}
            >
              <JsonPanel id={entry.timestamp} highlightedLines={diffLines}>
                {entryJson}
              </JsonPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DataPanel>
  );
}

/**
 * Handles the entire history page for a specific object.
 * @param history - History object for a database object
 */
export default function History({ history }: { history: HistoryObject }) {
  // Timestamps of expanded history panels
  const [expanded, setExpanded] = useState<string[]>([]);

  // Toggle the expansion of a history panel with the given id.
  function onExpandClick(event: MouseEvent<HTMLButtonElement>, id: string) {
    if (event.altKey || event.ctrlKey) {
      // User held down the option or control key when expanding or collapsing, so expand all
      // panels if the clicked panel is currently collapsed, or collapse all panels if the
      // clicked panel is currently expanded.
      if (expanded.includes(id)) {
        setExpanded([]);
      } else {
        setExpanded(history.history.map((entry) => entry.timestamp));
      }
    } else {
      // User didn't hold down a key when expanding or collapsing, so expand or collapse only the
      // clicked panel.
      setExpanded((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }
        return [...prev, id];
      });
    }
  }

  const currentProps = history.latest?.props;
  let previousEntry: HistoryEntry = null;

  return (
    <div>
      <PagePreamble />
      <PageHeader history={history} />
      {currentProps && (
        <div data-testid="history-current">
          <JsonPanel id="latest">
            {JSON.stringify(sortObjectProps(currentProps), null, 2)}
          </JsonPanel>
        </div>
      )}
      {history.history?.length > 0 && (
        <>
          {history.history.map((entry, i) => {
            previousEntry = history.history[i + 1];
            return (
              <Entry
                key={entry.timestamp}
                entry={entry}
                previousEntry={previousEntry}
                onExpandClick={onExpandClick}
                isPanelExpanded={expanded.includes(entry.timestamp)}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, query }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const url = `/${query.prefix}/${query.id}/@@history`;
  const history = (await request.getObject(url)).union();
  if (FetchRequest.isResponseSuccess(history)) {
    return {
      props: {
        history,
        pageContext: { title: `History: ${query.id}` },
      },
    };
  }
  return errorObjectToProps(history);
}
