// lib
import { encodeUriElement } from "./query-encoding";

/**
 * Constructs a URL path for the ID search page with the given search term.
 * @param searchTerm - Search term to be used in the ID search
 * @returns Path to the ID search page with the search term
 */
export function idSearchPath(searchTerm: string): string {
  return `/id-search?id=${encodeUriElement(searchTerm)}`;
}

/**
 * Constructs a URL path for the site search page with the given search term.
 * @param searchTerm - Search term to be used in the site search
 * @returns Path to the site search page with the search term
 */
export function siteSearchPath(searchTerm: string): string {
  return `/site-search/?query=${encodeUriElement(searchTerm)}`;
}
