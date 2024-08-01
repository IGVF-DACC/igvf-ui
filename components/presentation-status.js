// node_modules
import { useContext } from "react";
// components
import SessionContext from "./session-context";

/**
 * Generate additional query-string elements depending on the current browser state.
 */
export function useBrowserStateQuery({ addAmpersand = false }) {
  const { sessionProperties } = useContext(SessionContext);

  // Add status!=deleted to the query string if the authenticated user is an admin.
  const statusQuery = sessionProperties?.admin ? "status!=deleted" : "";
  return statusQuery ? `${addAmpersand ? "&" : ""}${statusQuery}` : "";
}
