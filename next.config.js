module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    nextTest: process.env.NEXT_PUBLIC_TEST,
  },
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "s.gravatar.com",
    ],
  },
}
