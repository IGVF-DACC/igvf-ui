// node_modules
import _ from "lodash";
// root
import type { DatabaseObject, SessionPropertiesObject } from "../globals";

/**
 * All possible audit levels, and just the public ones.
 */
export type AuditLevel =
  "ERROR" | "NOT_COMPLIANT" | "WARNING" | "INTERNAL_ACTION";
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
  isAuthenticated: boolean,
  sessionProperties: SessionPropertiesObject | null
): string[] {
  // A user with a lab is considered privileged and can see all audit levels, even INTERNAL_ACTION.
  // You can be authenticated but not privileged if you don't have a lab, in which case you can only
  // see public audit levels just as if you were unauthenticated.
  const isPrivilegedUser = sessionProperties?.user?.lab !== undefined;

  const visibleAuditLevels = item.audit
    ? Object.keys(item.audit).filter(
        (level): level is AuditLevel =>
          (isAuthenticated && isPrivilegedUser) || isPublicAuditLevel(level)
      )
    : [];
  const validAuditLevels = visibleAuditLevels.filter((level) =>
    auditLevelOrder.includes(level)
  );
  return validAuditLevels.length > 0
    ? _.sortBy(validAuditLevels, (level) => auditLevelOrder.indexOf(level))
    : [];
}
