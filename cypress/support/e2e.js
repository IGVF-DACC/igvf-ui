/// <reference types="cypress" />

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

/**
 * Forward console errors to Cypress so they can be logged in the test output.
 */
Cypress.on("fail", (err) => {
  cy.get("@consoleError").then((spy) => {
    if (spy?.calls?.count?.() > 0) {
      spy.getCalls().forEach((call, i) => {
        console.log(`[${i + 1}]`, ...call.args);
      });
    }
  });

  throw err;
});

/**
 * Completely disable performance measurement in Cypress environment to prevent "Failed to execute
 * 'measure' on 'Performance'" errors.
 */
Cypress.on("window:before:load", (win) => {
  // Override performance.mark to be a no-op
  win.performance.mark = function () {
    // Silently ignore all mark calls
    return undefined;
  };

  // Override performance.measure to be a no-op
  win.performance.measure = function () {
    // Silently ignore all measure calls
    return undefined;
  };

  // Override clearMarks to be a no-op
  win.performance.clearMarks = function () {
    // Silently ignore all clearMarks calls
    return undefined;
  };

  // Override clearMeasures to be a no-op
  win.performance.clearMeasures = function () {
    // Silently ignore all clearMeasures calls
    return undefined;
  };

  // Also disable getEntriesByType for marks and measures
  const originalGetEntriesByType = win.performance.getEntriesByType;
  win.performance.getEntriesByType = function (type) {
    if (type === "mark" || type === "measure") {
      return [];
    }
    return originalGetEntriesByType.call(this, type);
  };

  // Disable getEntriesByName for performance entries
  const originalGetEntriesByName = win.performance.getEntriesByName;
  win.performance.getEntriesByName = function (name, type) {
    if (type === "mark" || type === "measure" || !type) {
      return [];
    }
    return originalGetEntriesByName.call(this, name, type);
  };
});

/**
 * Suppress all performance-related errors in Cypress.
 */
Cypress.on("uncaught:exception", (err) => {
  // Suppress any performance measurement errors
  if (
    err.message.includes("Failed to execute 'measure' on 'Performance'") ||
    err.message.includes("Failed to execute 'mark' on 'Performance'") ||
    err.message.includes("beforeRender") ||
    err.message.includes("afterRender") ||
    (err.message.includes("Performance") &&
      (err.message.includes("mark") ||
        err.message.includes("measure") ||
        err.message.includes("does not exist")))
  ) {
    // Return false to prevent the error from failing the test
    return false;
  }
});
