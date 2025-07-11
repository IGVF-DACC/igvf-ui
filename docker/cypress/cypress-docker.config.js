const { defineConfig } = require("cypress");

module.exports = defineConfig({
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
});
