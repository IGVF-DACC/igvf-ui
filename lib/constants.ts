import getConfig from "next/config";
/* istanbul ignore file */

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

/**
 * igvf-ui NextJS server URL
 */
export const SERVER_URL = publicRuntimeConfig.SERVER_URL as string;

/**
 * igvfd server URL
 */
export const API_URL = publicRuntimeConfig.PUBLIC_BACKEND_URL as string;

/**
 * Docker internal network URL
 */
export const BACKEND_URL = serverRuntimeConfig.BACKEND_URL as string;

/**
 * igvf-ui version number
 */
export const UI_VERSION = publicRuntimeConfig.UI_VERSION as string;

/**
 * Auth0
 */
export const AUTH0_CLIENT_ID: string = "xaO8MMn04qlT3TUnhczmKWZgBzqRySDm";
export const AUTH0_ISSUER_BASE_DOMAIN: string = "igvf-dacc.us.auth0.com";
export const AUTH0_AUDIENCE: string = "https://igvf-dacc.us.auth0.com/api/v2/";

/**
 * Site title
 */
export const SITE_TITLE: string = "IGVF";

/**
 * Brand color
 */
export const BRAND_COLOR: string = "#337788";

/**
 * Path for authorization error page
 */
export const AUTH_ERROR_URI: string = "/auth-error";

/**
 * List of `@type`s to ignore. This needs updating when deprecated schemas get removed from igvfd.
 */
export const deprecatedSchemas: Array<string> = [];

/**
 * UNICODE entity codes, needed in JSX string templates. Each property named after the equivalent
 */
// HTML entity. Add new entries to this object as needed.
export const UC = {
  newline: "\u000A", // newline
  nbsp: "\u00A0", // non-breaking space
  deg: "\u00B0", // degree symbol
  ndash: "\u2013", // en dash
  mdash: "\u2014", // em dash
  lsquo: "\u2018", // Left single quote
  rsquo: "\u2019", // Right single quote
  ldquo: "\u201c", // Left double quote
  rdquo: "\u201d", // Right double quote
  hellip: "\u2026", // Horizontal ellipsis
  shift: "\u21E7", // Shift key
  ctrl: "\u2303", // Control key
  cmd: "\u2318", // Place of interest, command key
};

/**
 * Keyboard event key codes.
 */
export const KC = {
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  SPACE: 32,
};

/**
 * Maximum number of characters in the URL, minus an arbitrary amount for the domain name.
 */
export const MAX_URL_LENGTH: number = 4000;

/**
 * Default inline text styles for links.
 */
export const LINK_INLINE_STYLE: string = "font-medium";
