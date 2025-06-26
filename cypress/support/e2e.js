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
 * Handle the Cypress crash about performance marks by ignoring those harmless errors.
 */
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes(
      "Failed to execute 'measure' on 'Performance': The mark 'beforeRender' does not exist"
    )
  ) {
    // Returning false here prevents Cypress from failing the test.
    return false;
  }
});

/**
 * Forward console errors to Cypress so they can be logged in the test output.
 */
Cypress.on("fail", (err) => {
  cy.get("@consoleError").then((spy) => {
    if (spy?.calls?.count?.() > 0) {
      console.log("***** Console errors:");
      spy.getCalls().forEach((call, i) => {
        console.log(`[${i + 1}]`, ...call.args);
      });
    }
  });

  throw err;
});
