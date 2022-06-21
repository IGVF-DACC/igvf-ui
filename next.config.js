module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "s.gravatar.com",
    ],
  },
  serverRuntimeConfig: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  publicRuntimeConfig: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
}
