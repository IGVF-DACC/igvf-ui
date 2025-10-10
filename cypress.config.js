/**
 * Minimal Cypress config (CommonJS) – avoids importing 'cypress' so it works
 * even if node_modules isn't mounted inside a Docker container.
 */
module.exports = {
  projectId: "3vpsct",
  defaultCommandTimeout: 30000,
  video: true,
  retries: { runMode: 2, openMode: 0 },
  env: {
    CYPRESS_INTERNAL_ENV: "production",
    __NEXT_DISABLE_TELEMETRY: "1",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 800,
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    tsConfig: "tsconfig.cypress.json",
    setupNodeEvents(on) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome") {
          launchOptions.args.push("--no-sandbox");
          launchOptions.args.push("--disable-dev-shm-usage");
          launchOptions.args.push("--disable-gpu");
          launchOptions.args.push("--disable-software-rasterizer");
          launchOptions.args.push("--mute-audio");
          launchOptions.args.push("--disable-background-timer-throttling");
          launchOptions.args.push("--disable-backgrounding-occluded-windows");
          launchOptions.args.push("--disable-features=TranslateUI");
          launchOptions.args.push("--disable-web-security");
        }
        return launchOptions;
      });
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
};
