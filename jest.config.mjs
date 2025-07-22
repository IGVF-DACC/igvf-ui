import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  clearMocks: true,
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
