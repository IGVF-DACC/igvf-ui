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
 * Handle Auth0 login without the UI, but instead by writing to localstorage to simulate what the
 * Auth0 login would do. This code mostly copies:
 * https://github.com/charklewis/auth0-cypress
 * @param {string} username - The username to use for the login.
 * @param {string} password - The password to use for the login.
 */
Cypress.Commands.add("loginAuth0", (username, password) => {
  cy.visit("http://localhost:3000/");
  cy.clearLocalStorage();

  const client_id = Cypress.env("AUTH_CLIENT_ID");
  const client_secret = Cypress.env("AUTH_CLIENT_SECRET");
  const audience = Cypress.env("AUTH_AUDIENCE");
  const scope = "openid profile email offline_access";

  cy.request({
    method: "POST",
    url: Cypress.env("AUTH_URL"),
    body: {
      grant_type: "password",
      username,
      password,
      audience,
      scope,
      client_id,
      client_secret,
    },
  }).then(({ body: { access_token, expires_in, id_token, token_type } }) => {
    cy.window().then((window) => {
      window.localStorage.setItem(
        `@@auth0spajs@@::${client_id}::${audience}::${scope}`,
        JSON.stringify({
          body: {
            client_id,
            access_token,
            id_token,
            scope,
            expires_in,
            token_type,
            decodedToken: {
              user: JSON.parse(
                Buffer.from(id_token.split(".")[1], "base64").toString("ascii")
              ),
            },
            audience,
          },
          expiresAt: Math.floor(Date.now() / 1000) + expires_in,
        })
      );
      cy.reload();
    });
  });
});

/**
 * With Amazon OpenSearch, we have a need to insert delays after requests to allow the server to
 * process the request. This command lets you insert these delays when needed.
 * @param {string} delay Optional time to delay in ms
 */
Cypress.Commands.add("delayForIndexing", (delay = 3000) => {
  cy.wait(delay);
});

/**
 * Cypress can run into issues if we have a test interact with a page too soon after reloading the
 * page. This command lets you insert a delay after a reload to allow the page to load.
 * @param {string} delay Optional time to delay in ms
 */
Cypress.Commands.add("reloadWithDelay", (delay = 1000) => {
  cy.reload();
  cy.wait(delay);
});
