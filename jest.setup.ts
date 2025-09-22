import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

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

// Make TextEncoder and TextDecoder available globally in tests.
Object.assign(globalThis, { TextEncoder, TextDecoder });
