import getConfig from "next/config";
/* istanbul ignore file */

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

// igvf-ui NextJS server URL
export const SERVER_URL = publicRuntimeConfig.SERVER_URL;
// igvfd server URL
export const API_URL = publicRuntimeConfig.PUBLIC_BACKEND_URL;
// Docker internal network URL
export const BACKEND_URL = serverRuntimeConfig.BACKEND_URL;

// igvf-ui version number
export const UI_VERSION = publicRuntimeConfig.UI_VERSION;

// Log fetch-request
export const LOG_FETCH_REQUEST_TIME = serverRuntimeConfig.LOG_FETCH_REQUEST_TIME;
// Log getServerSideProps
export const LOG_GET_SERVER_SIDE_REQUEST_TIME = serverRuntimeConfig.LOG_GET_SERVER_SIDE_REQUEST_TIME;

// Auth0
export const AUTH0_CLIENT_ID = "xaO8MMn04qlT3TUnhczmKWZgBzqRySDm";
export const AUTH0_ISSUER_BASE_DOMAIN = "igvf-dacc.us.auth0.com";
export const AUTH0_AUDIENCE = "https://igvf-dacc.us.auth0.com/api/v2/";

// Site title
export const SITE_TITLE = "IGVF";
// Brand color
export const BRAND_COLOR = "#337788";
// Path for authorization error page
export const AUTH_ERROR_URI = "/auth-error";

// UNICODE entity codes, needed in JSX string templates. Each property named after the equivalent
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
  shift: "\u21E7", // Shift key
  ctrl: "\u2303", // Control key
  cmd: "\u2318", // Place of interest, command key
};

// Keyboard event key codes.
export const KC = {
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  SPACE: 32,
};
