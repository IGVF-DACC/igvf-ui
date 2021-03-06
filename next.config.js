module.exports = {
  reactStrictMode: false,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "s.gravatar.com",
    ],
  },
  serverRuntimeConfig: {
    BACKEND_URL: process.env.BACKEND_URL || "",
  },
  publicRuntimeConfig: {
    PUBLIC_BACKEND_URL:
      process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "",
  },
};
