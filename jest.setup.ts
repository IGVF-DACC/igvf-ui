import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

import { setConfig } from "next/config";

// Suppress act() warnings from Headless UI's FloatingProvider. These are internal to Headless UI
// and don't affect test validity.
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Convert all args to string and check for the warning pattern
    const fullMessage = args.map((arg) => String(arg)).join(" ");
    if (
      fullMessage.includes("FloatingProvider") &&
      fullMessage.includes("not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

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

// Mock navigator.clipboard for copy-to-clipboard tests.
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(async () => Promise.resolve()),
  },
});
jest.spyOn(navigator.clipboard, "writeText");

// Create the tooltip portal root element for all tests.
// This prevents "Target container is not a DOM element" errors in tooltip tests.
beforeEach(() => {
  const portalRoot = document.createElement("div");
  portalRoot.setAttribute("id", "tooltip-portal-root");
  portalRoot.setAttribute("data-testid", "tooltip-portal-root");
  document.body.appendChild(portalRoot);
});

afterEach(() => {
  const portalRoot = document.getElementById("tooltip-portal-root");
  if (portalRoot && portalRoot.parentNode === document.body) {
    document.body.removeChild(portalRoot);
  }
});
