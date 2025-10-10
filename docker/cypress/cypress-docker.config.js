/*
 * Docker-specific Cypress config.
 * Uses a plain object export so we don't depend on resolving the 'cypress' module
 * via import/require inside the container (the minimal volume mount may omit node_modules).
 */
module.exports = {
  defaultCommandTimeout: 30000,
  video: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    // Disable internal instrumentation that might rely on missing marks.
    CYPRESS_INTERNAL_ENV: "production",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 800,
    experimentalMemoryManagement: true,
    tsConfig: "tsconfig.cypress.json",
    setupNodeEvents(on) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome") {
          launchOptions.args.push("--no-sandbox");
          launchOptions.args.push("--disable-dev-shm-usage");
          launchOptions.args.push("--disable-gpu");
          launchOptions.args.push("--mute-audio");
        }
        return launchOptions;
      });
    },
  },
};
