// node_modules
import { useContext } from "react";
// components
import SessionContext from "./session-context";
// lib
import { getUserQueryExtras } from "../lib/query-utils";

/**
 * Generate additional query-string elements depending on the current browser state, preceded with
 * an ampersand.
 */
export function useBrowserStateQuery() {
  const { sessionProperties } = useContext(SessionContext);
  return getUserQueryExtras(sessionProperties);
}
