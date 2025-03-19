// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
// components
import { DataPanel } from "../components/data-area";
import { HistoryLink } from "../components/history-link";
import JsonPanel from "../components/json-panel";
import PagePreamble from "../components/page-preamble";
// lib
import FetchRequest from "../lib/fetch-request";
import { HistoryEntry, HistoryObject } from "../lib/history";
import { formatDate } from "../lib/dates";
import { sortObjectProps } from "../lib/general";

/**
 * Display a header for the history page that's similar to ObjectPageHeader but usable with the
 * history object.
 * @param history - History object for a database object
 */
function HistoryPageHeader({ history }: { history: HistoryObject }) {
  return (
    <div className="flex items-end justify-end gap-1">
      <HistoryLink basePath={history.rid} />
    </div>
  );
}

/**
 * Display the title of a history entry.
 * @param id - Timestamp of the history entry
 * @param isExpanded - Whether the history entry is expanded
 * @param onExpandClick - Function to call when the expand button is clicked
 */
function Title({
  id,
  isExpanded,
  onExpandClick,
}: {
  id: string;
  isExpanded: boolean;
  onExpandClick: (id: string) => void;
}) {
  return (
    <div className="px-2 py-1">
      <button
        onClick={() => onExpandClick(id)}
        className="flex items-center gap-2 font-semibold"
      >
        {isExpanded ? (
          <MinusIcon className="h-4 w-4" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
        {formatDate(id, "show-time")}
      </button>
    </div>
  );
}

function HistoryPanel({
  entry,
  onExpandClick,
  isPanelExpanded,
}: {
  entry: HistoryEntry;
  onExpandClick: (id: string) => void;
  isPanelExpanded: boolean;
}) {
  return (
    <DataPanel className="my-2" isPaddingSuppressed>
      <div className="bg-gray-200">
        <Title
          id={entry.timestamp}
          isExpanded={isPanelExpanded}
          onExpandClick={onExpandClick}
        />
        {isPanelExpanded && (
          <div className="pb-2 pl-2 pr-2">
            <JsonPanel id={entry.timestamp}>
              {JSON.stringify(sortObjectProps(entry.props), null, 2)}
            </JsonPanel>
          </div>
        )}
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
  function onExpandClick(id: string) {
    setExpanded((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  }

  const currentProps = history.latest?.props;

  return (
    <div>
      <PagePreamble />
      <HistoryPageHeader history={history} />
      {currentProps && (
        <JsonPanel id="latest">
          {JSON.stringify(sortObjectProps(currentProps), null, 2)}
        </JsonPanel>
      )}
      {history.history?.length > 0 && (
        <>
          {history.history.map((entry) => (
            <HistoryPanel
              key={entry.timestamp}
              entry={entry}
              onExpandClick={onExpandClick}
              isPanelExpanded={expanded.includes(entry.timestamp)}
            />
          ))}
        </>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, query }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const url = `/${query.prefix}/${query.id}/@@history/`;
  const history = (await request.getObject(url)).union();
  return {
    props: {
      history,
      pageContext: { title: `History: ${query.id}` },
    },
  };
}
