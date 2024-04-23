// node_modules
import _ from "lodash";
// Types
import { DatabaseObject } from "../globals.d";

/**
 * Order that audit levels should appear in the UI.
 */
const auditLevelOrder = [
  "ERROR",
  "WARNING",
  "NOT_COMPLIANT",
  "INTERNAL_ACTION",
];

/**
 * List of audit levels viewable without authentication.
 */
const publicLevels = auditLevelOrder.filter(
  (level) => level !== "INTERNAL_ACTION"
);

/**
 * Get the list of audit levels visible for the user's authentication level for the audits of a
 * database item.
 * @param item Item that might contain audits
 * @param isAuthenticated True if the user has authenticated
 * @returns Sorted list of audit levels that are visible to the user
 */
export function getVisibleItemAuditLevels(
  item: DatabaseObject,
  isAuthenticated: boolean
): string[] {
  const visibleAuditLevels = item.audit
    ? Object.keys(item.audit).filter((level) => {
        return isAuthenticated || publicLevels.includes(level);
      })
    : [];
  const validAuditLevels = visibleAuditLevels.filter((level) =>
    auditLevelOrder.includes(level)
  );
  return validAuditLevels.length > 0
    ? _.sortBy(validAuditLevels, (level) => auditLevelOrder.indexOf(level))
    : [];
}
