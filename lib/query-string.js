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

import * as queryEncoding from "./query-encoding";

export default class QueryString {
  #query;
  #parsedQuery;

  /**
   * Find the value of the key in a parsed QueryString element. Each element (documented in
   * `#parse`) is an object with the query-string key as the object key and the query-string value
   * as this object key's value, as well as a `negative` boolean.
   * @param {object} queryElement One parsed element of a QueryString object
   * @returns {string} Value of the key in an element of a parsed QueryString object
   */
  static #getQueryElementKey(queryElement) {
    // Looking for the query-string key, not the "negative" key.
    return Object.keys(queryElement).find((key) => key !== "negative");
  }

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
   * @param {string} isExact QueryString.EXACT for exact match, or nothing for subset match.
   * @returns {boolean} True if the two query strings represent the same query
   */
  static equal(query1, query2, matchOption = QueryString.EXACT) {
    const isSubsetMatching = query1.#parsedQuery.reduce(
      (equal, query1Element) => {
        if (equal) {
          // Find the key this element represents. Assume it exists; we have a bug if not.
          const query1Key = QueryString.#getQueryElementKey(query1Element);

          // So far only equal elements have been found. Search query2 for an element
          // matching an element from query1.
          const equalElement = query2.#parsedQuery.find((query2Element) => {
            const query2Key = QueryString.#getQueryElementKey(query2Element);
            return (
              query1Key === query2Key &&
              query1Element[query1Key] === query2Element[query2Key] &&
              query1Element.negative === query2Element.negative
            );
          });
          return !!equalElement;
        }

        // Once we can't find an equal element, we can stop searching.
        return false;
      },
      true
    );

    return matchOption === QueryString.EXACT
      ? isSubsetMatching &&
          query1.#parsedQuery.length === query2.#parsedQuery.length
      : isSubsetMatching;
  }

  /**
   * The following three static methods let you specify the polarity of key/value pairs, either
   * positive, negative, or either. For example, if you want to add a key/value pair to a query
   * with a != relationship, use:
   * ```query.addKeyValue("key", "value", QueryString.NEG);```
   *
   * If you want to get all "type=" keys regardless of their polarities, use:
   * ```query.getKeyValues("type", QueryString.ANY);```
   * This could return things like `type=Experiment` and `type!=Lab`.
   *
   * If you want to get all keys only with a positive polarity, use:
   * ```query.getKeyValues("key", QueryString.POS);```
   * This would only return things like `type=Experiment` but not `type!=Lab`.
   */
  static get POS() {
    return "pos";
  }

  static get NEG() {
    return "neg";
  }

  static get ANY() {
    return "*";
  }

  /**
   * The following two static methods let you specify whether you want the `equal` static method to
   * match the query string exactly or if you want to match a subset of the query string.
   */
  static get EXACT() {
    return "exact";
  }

  static get SUBSET() {
    return "subset";
  }

  constructor(query) {
    this.#query = query[0] === "?" ? query.slice(1) : query;
    this.#parsedQuery = [];
    this.#parse();
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
   * @return {object} Reference to this object for method chaining
   */
  #parse() {
    // Filter out any empty elements caused by a trailing ampersand.
    if (this.#query) {
      const inputQueryElements = this.#query
        .split("&")
        .filter((element) => element);
      this.#parsedQuery = inputQueryElements.map((element) => {
        // Split each query string element into its key and value in `queryElement`. If "!" is at
        // the end of the key, then this was a != query-string element. In that case set the
        // `negative` property in `queryElement` and strip the "!" from the key.
        const queryElement = {};
        const keyValue = element.split("=");
        const negationMatch = keyValue[0].match(/(.*?)(%21|!)*$/);
        queryElement[negationMatch[1]] = queryEncoding.decodeUriElement(
          keyValue[1]
        );
        queryElement.negative =
          negationMatch[2] === "%21" || negationMatch[2] === "!";
        return queryElement;
      });
    } else {
      this.#parsedQuery = [];
    }
    return this;
  }

  /**
   * Add a key/value pair to the query string. This doesn't check if the same key already exists so
   * your key can exist multiple times in the formatted query string.
   * @param {string} key Key to add to query string
   * @param {*} value Non-URL-encoded value to add to query string. Numbers converted to strings
   * @param {string} polarity: QueryString.POS or QueryString.NEG
   * @return {object} Reference to this object for method chaining
   */
  addKeyValue(key, value, polarity = QueryString.POS) {
    const keyValue = {};
    keyValue[key] = typeof value === "number" ? value.toString() : value;
    keyValue.negative = Boolean(polarity === QueryString.NEG);
    this.#parsedQuery.push(keyValue);
    return this;
  }

  /**
   * Delete any key/value pairs matching the given `key` and `value`, or all matching keys
   * regardless of their value if you don't pass `value`.
   * @param {string} key Key value to delete
   * @param {string} value Optional non-URL-encoded value to also match to delete
   * @return {object} Reference to this object for method chaining.
   */
  deleteKeyValue(key, value) {
    this.#parsedQuery = this.#parsedQuery.filter(
      (element) =>
        element[key] === undefined ||
        (value !== undefined ? element[key] !== value : false)
    );
    return this;
  }

  /**
   * Replace any key/value pairs matching the given `key` with the given `value`, so if multiple
   * existing key/value pairs match the given key, they all get removed and replaced by this new
   * key/value pair.
   * @param {string} key Key value to replace
   * @param {string} value Non-URL-encoded value to replace
   * @param {string} polarity QueryString.POS or QueryString.NEG
   * @param {object} Reference to this object for method chaining.
   */
  replaceKeyValue(key, value, polarity = QueryString.POS) {
    this.deleteKeyValue(key).addKeyValue(key, value, polarity);
    return this;
  }

  /**
   * Return an array of values whose keys match the `key` string parameter. For example, for the
   * query string "a=1&b=2&a=3&b!=3" the resulting array for `key` of "a" returns [1, 3], and a
   * `key` of "b" would return [2]. If you pass `negative` as true, then a `key` of "a" is [] and a
   * `key` of "b" return [3].
   * @param {string} key Key whose values get returned
   * @param {bool} polarity QueryString.POS, QueryString.NEG, or QueryString.ANY
   * @return {array} Non-URL-encoded values that have `key` as their key
   */
  getKeyValues(key, polarity = QueryString.POS) {
    return this.#parsedQuery
      .filter((queryElement) => {
        // Polarity matches if QueryString.ANY specified, or if the polarity of the query
        // element matches the polarity parameter.
        const isPolarityMatching =
          polarity === QueryString.ANY ||
          queryElement.negative === Boolean(polarity === QueryString.NEG);
        return queryElement[key] && isPolarityMatching;
      })
      .map((queryElement) => queryElement[Object.keys(queryElement)[0]]);
  }

  /**
   * Get the number of query string elements for any key or a specific key.
   * @param {string} key Optional key to count; count all keys if not supplied
   * @return {number} Count of query string elements
   */
  queryCount(key) {
    if (key) {
      return this.#parsedQuery.filter((queryElement) => queryElement[key])
        .length;
    }
    return this.#parsedQuery.length;
  }

  /**
   * Get the query string corresponding to the query this object holds. If you have made no
   * modifications to the query this object holds, you get back the same query string that
   * initialized this object.
   * @return {string} Equivalent query string
   */
  format() {
    return this.#parsedQuery
      .map((queryElement) => {
        const key = Object.keys(queryElement)[0];
        return `${key}${
          queryElement.negative ? "!=" : "="
        }${queryEncoding.encodeUriElement(queryElement[key])}`;
      })
      .join("&");
  }

  /**
   * Make a clone of this query string object that can be manipulated independently of this one.
   * @return {object} Cloned QueryString object
   */
  clone() {
    return new QueryString(this.format());
  }
}
