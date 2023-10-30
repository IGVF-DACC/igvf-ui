// node_modules
import _ from "lodash";

/**
 * Holds a single counted string, with the string as a key and the number of times it appears as
 * the value.
 */
export interface CountedString {
  [key: string]: number;
}

/**
 * Convert a counted string array to an array of those strings followed by their counts in
 * parentheses. Strings with a count of 1 appear without a count.
 * Example: [{a: 2}, {A: 1}, {b: 2}, {c: 1}] -> ["a (2)", "A", "b (2)", "c"]
 * @param {CountedString[]} countedStrings Strings and their corresponding counts
 * @returns {string[]} Strings with counts in parentheses
 */
export function countedStringsToStringsWithCounts(
  countedStrings: CountedString[]
): string[] {
  return countedStrings.map((item) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    if (value === 1) {
      return key;
    }
    return `${key} (${value})`;
  });
}

/**
 * Given an array of strings with possible duplicates, return an array of objects with each
 * unique string as the key and the number of times it appears in the array as the value. Sort
 * the objects alphabetically by the string, case insensitive.
 * Example: ["a", "b", "a", "c", "b", "A"] -> [{a: 2}, {A: 1}, {b: 2}, {c: 1}]
 * @param {string[]} items Strings to count
 * @returns {CountedString[]} Strings and their corresponding counts
 */
export function stringsToCountedStrings(items: string[]): CountedString[] {
  const counts: CountedString = {};

  // First build a single object with each string as a key and the number of times it appears as the
  // value.
  items.forEach((item) => {
    if (counts[item]) {
      counts[item] += 1;
    } else {
      counts[item] = 1;
    }
  });

  // Sort the strings alphabetically, then map each string to an object with the string as the
  // key and the number of times it appears as the value.
  const uniqueSortedStrings = _.sortBy(Object.keys(counts), [
    (str) => str.toLowerCase(),
  ]);
  return uniqueSortedStrings.map((item) => ({ [item]: counts[item] }));
}

/**
 * Convert an array of strings with possible duplicates to an array of strings with duplicates
 * removed, followed by their counts in parentheses. Strings with a count of 1 appear without a
 * count.
 * Example: ["a", "b", "a", "c", "b", "A"] -> ["a (2)", "A", "b (2)", "c"]
 * @param {string[]} items Strings to count
 * @returns {string[]} Strings with counts in parentheses
 */
export function stringsToStringsWithCounts(items: string[]): string[] {
  return countedStringsToStringsWithCounts(stringsToCountedStrings(items));
}
