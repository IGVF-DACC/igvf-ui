/**
 * Mock the clipboard API.
 */
import { jest } from "@jest/globals";

// Mock navigator.clipboard.writeText.
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});
jest.spyOn(navigator.clipboard, "writeText");
