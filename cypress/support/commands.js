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
Cypress.Commands.add("delayForIndexing", (reload = true, delay = 20000) => {
  cy.wait(delay);
  if (reload) {
    cy.reload();
  }
});

/**
 * Cypress can run into issues if we have a test interact with a page too soon after reloading the
 * page. This command lets you insert a delay after a reload to allow the page to load.
 * @param {string} delay Optional time to delay in ms; none or 0 means 2000 ms
 * @param {boolean} waitForLogin Optional flag to wait for login name to appear
 */
Cypress.Commands.add(
  "reloadWithDelay",
  (delay = 2000, waitForLogin = false) => {
    const actualDelay = delay || 2000;
    cy.reload();
    cy.wait(actualDelay);
    if (waitForLogin) {
      cy.get(`[data-testid="navigation-authenticate"]`).should(
        "contain",
        "Cypress Testing"
      );
    }
  }
);
