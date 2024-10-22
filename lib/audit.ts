// node_modules
import _ from "lodash";
// Types
import { DatabaseObject } from "../globals.d";

/**
 * All possible audit levels, and just the public ones.
 */
export type AuditLevel =
  | "ERROR"
  | "NOT_COMPLIANT"
  | "WARNING"
  | "INTERNAL_ACTION";
export type PublicAuditLevel = Exclude<AuditLevel, "INTERNAL_ACTION">;

/**
 * Order that audit levels should appear in the UI.
 */
export const auditLevelOrder: readonly AuditLevel[] = [
  "ERROR",
  "NOT_COMPLIANT",
  "WARNING",
  "INTERNAL_ACTION",
];

/**
 * Typescript can't generate arrays from union types 😭
 */
const publicLevels: PublicAuditLevel[] = ["ERROR", "WARNING", "NOT_COMPLIANT"];

/**
 * Test whether an audit level is a public or not.
 * @param level Audit level to check
 * @returns True if the audit level is a public audit level
 */
function isPublicAuditLevel(level: string): level is PublicAuditLevel {
  return publicLevels.includes(level as PublicAuditLevel);
}

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
    ? Object.keys(item.audit).filter((level): level is AuditLevel => {
        return isAuthenticated || isPublicAuditLevel(level);
      })
    : [];
  const validAuditLevels = visibleAuditLevels.filter((level) =>
    auditLevelOrder.includes(level)
  );
  return validAuditLevels.length > 0
    ? _.sortBy(validAuditLevels, (level) => auditLevelOrder.indexOf(level))
    : [];
}
