/// <reference types="cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Login with auth0. This code mostly copies:
 * https://www.youtube.com/watch?v=Fohrq5GZSD8
 * @param {string} username The username to use for the login
 * @param {string} password The password to use for the login
 * @param {boolean} isHomeFirst True to visit the home page before logging in
 */
Cypress.Commands.add("loginAuth0", (username, password, isHomeFirst = true) => {
  const args = { username, password };
  cy.clearCookies();

  if (isHomeFirst) {
    cy.visit("/");
  }
  cy.get(`[data-testid="navigation-authenticate"]`).click();

  // Login on Auth0 through the auth0 sign-in page.
  cy.origin("auth.igvf.org", { args }, ({ username, password }) => {
    cy.get("#1-email").type(username);
    cy.get("#1-password").type(password);
    cy.get("button[type=submit]").click();
  });
});

/**
 * Logout of the site using the UI.
 */
Cypress.Commands.add("logoutAuth0", () => {
  cy.get(`[data-testid="navigation-authenticate"]`).click();
  cy.get(`[data-testid="navigation-signout"]`).click();
  cy.get("#sign-out-confirm").click();
});

/**
 * With Amazon OpenSearch, we have a need to insert delays after requests to allow the server to
 * process the request. This command lets you insert these delays when needed.
 * @param {string} delay Optional time to delay in ms
 */
// Add a custom command called "delayForIndexing"
Cypress.Commands.add("delayForIndexing", () => {
  function checkAndClick() {
    cy.get("#indexer-outline").click(); // Click the button
    cy.wait(1000); // Wait for a second to allow changes

    cy.get("#indexer-outline")
      .invoke("text")
      .then((text) => {
        if (text.includes("INDEXING")) {
          // Log and recursively call the function if "INDEXING" is present
          cy.log('Button still says "INDEXING", clicking again...');
          cy.wait(5000);
          checkAndClick(); // Repeat the process
        } else {
          cy.log('Button text no longer contains "INDEXING". Stopping.');
        }
      });
  }

  // Initial call to start the process
  checkAndClick();
});

/**
 * Cypress can run into issues if we have a test interact with a page too soon after reloading the
 * page. This command lets you insert a delay after a reload to allow the page to load.
 * @param {string} delay Optional time to delay in ms
 */
Cypress.Commands.add("reloadWithDelay", (delay = 2000) => {
  cy.reload();
  cy.wait(delay);
});
