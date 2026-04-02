/// <reference types="cypress" />

/**
 * Convert a string, potentially containing characters that need to be escaped in a regular
 * expression, to a string where those characters are escaped.
 * e.g. Award (Grant) -> Award \(Grant\)
 * @param string {string} The string to escape
 * @returns {string} The escaped string
 */
describe("Navigation", () => {
  it("should navigate to other pages from the home page", () => {
    cy.visit("/");

    // Test Data Model submenus.
    cy.get("[data-testid=navigation-data-model]").click();

    cy.get("[data-testid=navigation-schemas]").click();
    cy.url().should("include", "/profiles/");
    cy.get("h1").should("have.text", "Schema Directory");

    // Test Data submenus.
    cy.get("[data-testid=navigation-data]").click();

    cy.get("[data-testid=navigation-raw-datasets]").click();
    cy.url().should("include", "/search/?type=MeasurementSet");
    cy.get("h1").should("exist"); // Actual title depends on data

    cy.get("[data-testid=navigation-processed-datasets]").click();
    cy.url().should("include", "/search/?type=AnalysisSet");
    cy.get("h1").should("exist"); // Actual title depends on data

    cy.get("[data-testid=navigation-files]").click();
    cy.url().should("include", "/search/?type=File");
    cy.get("h1").should("exist"); // Actual title depends on data
  });

  // Shared login helper using cy.session() to cache Auth0 cookies across the two schema tests,
  // avoiding a full OAuth roundtrip for the second test while still giving Chrome a fresh context.
  function loginWithSession() {
    cy.session("auth0-session", () => {
      cy.visit("/");
      cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
      cy.contains("Cypress Testing");
    });
  }

  it("should load every schema's list page", () => {
    loginWithSession();
    cy.visit("/profiles/");

    // Wait for the session context to finish loading so the links reflect the authenticated user's
    // query params (status!=deleted) rather than the anonymous-user defaults (status=released).
    cy.get(`[aria-label^="List view of all"]`)
      .first()
      .should("have.attr", "href")
      .and("include", "status!=deleted");

    // Collect up all the list view links for every schema.
    const listHrefs = [];
    cy.get(`[data-testid^="schema-"]`).each(($schema) => {
      const href = $schema
        .find(`[aria-label^="List view of all"]`)
        .attr("href");
      listHrefs.push(href);
    });

    // Request each list page to make sure it returns a 200.
    cy.then(() => {
      listHrefs.forEach((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
    });
  });

  it("should load every schema's report page", () => {
    loginWithSession();
    cy.visit("/profiles/");

    // Wait for the session context to finish loading so the links reflect the authenticated user's
    // query params (status!=deleted) rather than the anonymous-user defaults (status=released).
    cy.get(`[aria-label^="Report view of all"]`)
      .first()
      .should("have.attr", "href")
      .and("include", "status!=deleted");

    // Collect up all the report view links for every schema.
    const reportHrefs = [];
    cy.get(`[data-testid^="schema-"]`).each(($schema) => {
      const href = $schema
        .find(`[aria-label^="Report view of all"]`)
        .attr("href");
      reportHrefs.push(href);
    });

    // Request each report page to make sure it returns a 200.
    cy.then(() => {
      reportHrefs.forEach((href) => {
        cy.request(href).its("status").should("eq", 200);
      });
    });
  });
});
