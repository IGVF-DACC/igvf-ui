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

Cypress.on("window:before:load", (win) => {
  const originalMeasure = win.performance.measure;
  win.performance.measure = function (name, ...args) {
    if (typeof name === "string" && name.includes("beforeRender")) {
      // Skip the problematic measure entirely
      return;
    }
    return originalMeasure.call(this, name, ...args);
  };
});

/**
 * Suppress known benign errors related to performance marks, specifically the error:
 * SyntaxError: Failed to execute 'measure' on 'Performance': The mark 'beforeRender' does not
 * exist.
 */
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Failed to execute 'measure' on 'Performance'") &&
    err.message.includes("beforeRender")
  ) {
    return false;
  }
});
