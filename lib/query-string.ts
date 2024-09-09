/**
 * Module allowing you to conveniently modify query strings by their keys and values without
 * having to modify the actual query string itself. The general process to follow:
 *
 * const query = new QueryString(queryStringFromUrl);
 * ...modify or test `query` through public operations defined in the class...
 * query.format()
 *
 * query.format() generates a final query string based on the modifications you have made, if any.
 * The leading question mark does not get included, though a leading question mark gets accepted
 * and ignored when creating a QueryString object.
 *
 * Internally, values of key/value pairs get stored in their decoded forms (i.e. spaces are spaces,
 * not "+" or "%20"). They get decoded when a QueryString object gets created, and only get encoded
 * in the output of format().
 *
 * The URL() interface (https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) has much of this
 * module's functionality, with a couple limitations:
 *   * URL() requires a full URL, but -- especially on the server -- we often only have relative
 *     URIs.
 *   * URL() cannot retrieve multiple values for the same key through its getter (e.g.
 *     "type=Lab&type=User" -- you cannot retrieve the "User" value with URL.searchParams.get()).
 *     This QueryString module returns arrays of values for a key that appears multiple times in
 *     the query string.
 */

// lib
import * as queryEncoding from "./query-encoding";

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

/**
 * Interface for a query-string element as stored in the `QueryString` class. Each represents a
 * single key/value pair in a query string. The `QueryString` class stores these in an array of
 * these objects, one for each key/value pair in the query string. Each object has a `key` string
 * property for the query-string key, a `value` string property for the query-string value, and a
 * `negative` boolean property for whether the query-string element has a != relationship.
 * @typedef {object} QueryStringElement
 * @property {string} key Query-string key
 * @property {string} value Query-string value; numbers converted to strings
 * @property {boolean} negative True if the query-string element has a != relationship
 */
interface QueryStringElement {
  key: string;
  value: string;
  negative: boolean;
}

export default class QueryString {
  private query = "";
  private parsedQuery: Array<QueryStringElement> = [];

  /**
   * Compare two `QueryString` objects to see if they represent the same query. The two query
   * strings don't need to have their elements in the same order to consider them equal -- they
   * simply need to have the same keys and values, and the same negations ("=" vs "!=") for each.
   * If `isExact` is true, then the two query strings must also have the same number of elements.
   * Otherwise, `equal()` returns true if `query1` has all the elements of `query2` even if
   * `query2` has other elements not in `query1`. `equal()` might not return the correct value if
   * either query string has repeated key with different values.
   * @param {QueryString} query1 First QueryString object to compare
   * @param {QueryString} query2 Second QueryString object to compare
   * @param {QueryStringMatchType} matchType QueryString.EXACT for exact match, or nothing for subset match.
   * @returns {boolean} True if the two query strings represent the same query
   */
  public static equal(
    query1: QueryString,
    query2: QueryString,
    matchType: QueryStringMatchType = "EXACT"
  ): boolean {
    const isSubsetMatching = query1.parsedQuery.reduce(
      (equal, query1Element) => {
        if (equal) {
          // So far only equal elements have been found. Search query2 for an element
          // matching an element from query1.
          const equalElement = query2.parsedQuery.find((query2Element) => {
            return (
              query1Element.key === query2Element.key &&
              query1Element.value === query2Element.value &&
              query1Element.negative === query2Element.negative
            );
          });
          return Boolean(equalElement);
        }

        // Once we can't find an equal element, we can stop searching.
        return false;
      },
      true
    );

    return matchType === "EXACT"
      ? isSubsetMatching &&
          query1.parsedQuery.length === query2.parsedQuery.length
      : isSubsetMatching;
  }

  constructor(query: string) {
    if (query) {
      // Strip the leading question mark if it exists.
      this.query = query[0] === "?" ? query.slice(1) : query;
    } else {
      this.query = "";
    }
    this.parse();
  }

  /**
   * Parse the `#query` string into an array of query-string elements, each an object with the
   * query-string key becoming a key in the object with the query-string value its value, and a
   * `negative` key false for a=b query string parameters, and true for a!=b. For example, the
   * query string "type=Experiment&organism=human&assay!=ChIP-seq" becomes:
   * [{
   *     type: 'Experiment',
   *     negative: false,
   * }, {
   *     organism: 'human',
   *     negative: false,
   * }, {
   *     assay: 'ChIP-seq',
   *     negative: true,
   * }]
   *
   * The order of the elements in the array maintains the order they existed in the original query
   * string.
   * @returns {QueryString} Reference to this object for method chaining
   */
  private parse(): QueryString {
    // Filter out any empty elements caused by a trailing ampersand.
    if (this.query) {
      const inputQueryElements = this.query
        .split("&")
        .filter((element) => element);
      this.parsedQuery = inputQueryElements
        .map((element) => {
          // Split each query string element into its key and value in `queryElement`. If "!" is at
          // the end of the key, then this was a != query-string element. In that case set the
          // `negative` property in `queryElement` and strip the "!" from the key.
          const queryElement: QueryStringElement = {
            key: "",
            value: "",
            negative: false,
          };
          const keyValue = element.split("=");
          const negationMatch = keyValue[0].match(/^(.+?)(%21|!)*$/);
          if (negationMatch) {
            queryElement.key = negationMatch[1];
            queryElement.value = queryEncoding.decodeUriElement(keyValue[1]);
            queryElement.negative =
              negationMatch[2] === "%21" || negationMatch[2] === "!";
            return queryElement;
          }
          return null;
        })
        .filter((element): element is QueryStringElement => element !== null);
    } else {
      this.parsedQuery = [];
    }
    return this;
  }

  /**
   * Add a key/value pair to the query string. This doesn't check if the same key already exists so
   * your key can exist multiple times in the formatted query string.
   * @param {string} key Key to add to query string
   * @param {string | number} value Non-URL-encoded value to add to query string. Numbers converted to strings
   * @param {QueryStringPolarity} polarity? "POSITIVE" for = relationship, or "NEGATIVE" for != relationship
   * @returns {QueryString} Reference to this object for method chaining
   */
  public addKeyValue(
    key: string,
    value: string | number,
    polarity: QueryStringPolarity = "POSITIVE"
  ): QueryString {
    const keyValue = {
      key,
      value: typeof value === "number" ? value.toString() : value,
      negative: Boolean(polarity === "NEGATIVE"),
    };
    this.parsedQuery.push(keyValue);
    return this;
  }

  /**
   * Delete any key/value pairs matching the given `key` and `value`, or all matching keys
   * regardless of their value if you don't pass `value`.
   * @param {string} key Key value to delete
   * @param {string} value? Non-URL-encoded value to also match to delete
   * @returns {QueryString} Reference to this object for method chaining.
   */
  public deleteKeyValue(key: string, value?: string | number): QueryString {
    this.parsedQuery = this.parsedQuery.filter(
      (element) =>
        element.key !== key ||
        (value !== undefined ? element.value !== value : false)
    );
    return this;
  }

  /**
   * Replace any key/value pairs matching the given `key` with the given `value`, so if multiple
   * existing key/value pairs match the given key, they all get removed and replaced by this new
   * key/value pair.
   * @param {string} key Key value to replace
   * @param {string} value Non-URL-encoded value to replace
   * @param {QueryStringPolarity} polarity? "POSITIVE" for = relationship, or "NEGATIVE"
   *   for != relationship
   * @returns {QueryString} Reference to this object for method chaining.
   */
  public replaceKeyValue(
    key: string,
    value: string | number,
    polarity: QueryStringPolarity = "POSITIVE"
  ): QueryString {
    this.deleteKeyValue(key).addKeyValue(key, value, polarity);
    return this;
  }

  /**
   * Return an array of values whose keys match the `key` string parameter. For example, for the
   * query string "a=1&b=2&a=3&b!=3" the resulting array for `key` of "a" returns [1, 3], and a
   * `key` of "b" would return [2]. If you pass `negative` as true, then a `key` of "a" is [] and a
   * `key` of "b" return [3].
   * @param {string} key Key whose values get returned
   * @param {string} polarity? "POSITIVE" for = relationship, "NEGATIVE" for != relationship, or
   *  "ANY" for either
   * @returns {Array<string>} Non-URL-encoded values that have `key` as their key
   */
  public getKeyValues(
    key: string,
    polarity: QueryStringPolarity = "POSITIVE"
  ): Array<string> {
    return this.parsedQuery
      .filter((queryElement) => {
        // Polarity matches for "ANY" polarity, or if the polarity of the query element matches
        // the polarity parameter.
        const isPolarityMatching =
          polarity === "ANY" ||
          queryElement.negative === Boolean(polarity === "NEGATIVE");
        return queryElement.key === key && isPolarityMatching;
      })
      .map((queryElement) => queryElement.value);
  }

  /**
   * Get the number of query string elements for any key or a specific key.
   * @param {string} key? Optional key to count; count all keys if not supplied
   * @returns {number} Count of query string elements
   */
  public queryCount(key: string = ""): number {
    if (key) {
      return this.parsedQuery.filter((queryElement) => queryElement.key === key)
        .length;
    }
    return this.parsedQuery.length;
  }

  /**
   * Get the query string corresponding to the query this object holds. If you have made no
   * modifications to the query this object holds, you get back the same query string that
   * initialized this object.
   * @returns {string} Equivalent query string
   */
  public format(): string {
    return this.parsedQuery
      .map((queryElement) => {
        return `${queryElement.key}${
          queryElement.negative ? "!=" : "="
        }${queryEncoding.encodeUriElement(queryElement.value)}`;
      })
      .join("&");
  }

  /**
   * Make a clone of this query string object that can be manipulated independently of this one.
   * @returns {QueryString} Cloned QueryString object
   */
  clone(): QueryString {
    return new QueryString(this.format());
  }
}
