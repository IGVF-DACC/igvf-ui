import "@testing-library/jest-dom";

import { setConfig } from "next/config";
const config = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    BACKEND_URL: "",
  },
  publicRuntimeConfig: {
    SERVER_URL: "",
    PUBLIC_BACKEND_URL: "",
  },
};

// Use runtime config in tests.
setConfig(config);
