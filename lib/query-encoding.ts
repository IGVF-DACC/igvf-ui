/**
 * Just like encodeURIComponent, but does igvfd-specific character replacement to avoid 301
 * redirects. Only use this for the value on the right side of the query-string key-value equals
 * sign.
 * http://stackoverflow.com/questions/8143085/passing-and-through-a-uri-causes-a-403-error-how-can-i-encode-them#answer-8143232
 * @param {string} value Query-string value that needs encoding
 * @return {string} URL-encoded query-string value.
 */
export function encodeUriElement(value: string): string {
  return encodeURIComponent(value)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/%3A/g, ":") // Reverts encodeURIComponent colon encoding
    .replace(/%20/g, "+");
}

/**
 * Just like decodeURIComponent, but also converts plus signs into spaces. This function acts as
 * the complement to encodeUriElement above.
 * @param {string} value URL-encoded value from a key-value query-string pair
 * @return {string} Unencoded query-string value
 */
export function decodeUriElement(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, "%20"));
}
