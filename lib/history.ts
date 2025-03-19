/**
 * Types for the @@history display.
 */

export type HistoryEntry = {
  timestamp: string;
  userid: string;
  props: object;
};

export type HistoryObject = {
  rid: string;
  latest: HistoryEntry;
  history: HistoryEntry[];
};
