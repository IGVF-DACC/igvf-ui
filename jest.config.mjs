import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  clearMocks: true,
  // Only treat files with .test. or .spec. in the name as test suites. The Next.js default
  // also matches any file inside __tests__/, which would incorrectly pick up test helper
  // files (e.g. mock utilities) that live there but aren't test suites themselves.
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleDirectories: [
    "<rootDir>/node_modules",
    "<rootDir>/components",
    "<rootDir>/lib",
  ],
  modulePathIgnorePatterns: ["<rootDir>/cdk/"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/cypress",
    "<rootDir>/docker",
    "<rootDir>/node_modules/",
    "<rootDir>/public",
    "<rootDir>/styles",
    "<rootDir>/cdk/",
  ],
  transformIgnorePatterns: ["/node_modules/(?!marked)/"],
};

export default createJestConfig(customJestConfig);
