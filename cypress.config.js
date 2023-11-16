import { defineConfig } from "cypress";

module.exports = defineConfig({
  projectId: "3vpsct",
  defaultCommandTimeout: 30000,
  viewportWidth: 1282,
  viewportHeight: 800,
  watchForFileChanges: true,
  video: true,
  e2e: {
    experimentalRunAllSpecs: true,
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
});
