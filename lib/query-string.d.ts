/**
 * Specify the polarity of key/value pairs, either positive, negative, or either. For example, if
 * you want to add a key/value pair to a query with a != relationship, use:
 * ```query.addKeyValue("key", "value", "NEGATIVE");```
 *
 * If you want to get all "type=" keys regardless of their polarities, use:
 * ```query.getKeyValues("type", "ANY");```
 * This could return things like `type=Experiment` and `type!=Lab`.
 *
 * If you want to get all keys only with a positive polarity, use:
 * ```query.getKeyValues("key", "POSITIVE");```
 * This would only return things like `type=Experiment` but not `type!=Lab`.
 */
export type QueryStringPolarity = "POSITIVE" | "NEGATIVE" | "ANY";

/**
 * Specify whether you want the `equal` static method to match the query string exactly or if you
 * want to match a subset of the query string.
 */
export type QueryStringMatchType = "EXACT" | "SUBSET";
