const nextJest = require("next/jest")

const createJestConfig = nextJest({ dir: "./" })

const customJestConfig = {
  clearMocks: true,
  moduleDirectories: [
    "<rootDir>/node_modules",
    "<rootDir>/components",
    "<rootDir>/libs",
  ],
  setupFilesAfterEnv: ["./jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/cypress",
    "<rootDir>/docker",
    "<rootDir>/node_modules/",
    "<rootDir>/public",
    "<rootDir>/styles",
  ],
}

module.exports = createJestConfig(customJestConfig)
