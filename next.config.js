/**
 * Change the UI version number for each igvf-ui release.
 */
const UI_VERSION = "8.42.0";

module.exports = {
  trailingSlash: true,
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
    CACHE_URL: process.env.CACHE_URL || "",
  },
  publicRuntimeConfig: {
    SERVER_URL: process.env.SERVER_URL || "",
    PUBLIC_BACKEND_URL:
      process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "",
    UI_VERSION,
  },
  async rewrites() {
    return [
      {
        // Redirect object history requests to the common history renderer.
        source: "/:prefix/:id/@@history",
        destination: "/history", // Common history renderer
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/profiles/graph.dot",
        destination: "/profiles/graph.svg",
        permanent: true,
      },
    ];
  },
};
