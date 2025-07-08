import { defineConfig } from "cypress";

export default defineConfig({
  // ... your existing config
  projectId: "3vpsct",
  defaultCommandTimeout: 30000,
  video: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    experimentalRunAllSpecs: true,
    setupNodeEvents(on) {
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.name === "chrome") {
          launchOptions.args.push("--no-sandbox");
          launchOptions.args.push("--disable-dev-shm-usage");
          launchOptions.args.push("--disable-gpu");
          launchOptions.args.push("--disable-software-rasterizer");
          launchOptions.args.push("--mute-audio");
        }
        return launchOptions;
      });
    },
  },
});
