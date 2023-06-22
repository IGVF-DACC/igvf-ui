/**
 * Change the UI version number for each igvf-ui release.
 */
const UI_VERSION = "4.2.0";

const LOG_FETCH_REQUEST_TIME = true;

const LOG_GET_SERVER_SIDE_REQUEST_TIME = true;

module.exports = {
  reactStrictMode: false,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "s.gravatar.com",
      "localhost",
    ],
  },
  serverRuntimeConfig: {
    BACKEND_URL: process.env.BACKEND_URL || "",
    LOG_FETCH_REQUEST_TIME,
    LOG_GET_SERVER_SIDE_REQUEST_TIME,
  },
  publicRuntimeConfig: {
    SERVER_URL: process.env.SERVER_URL || "",
    PUBLIC_BACKEND_URL:
      process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "",
    UI_VERSION,
  },
};
