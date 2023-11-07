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

    cy.get("[data-testid=navigation-overview]").click();
    cy.url().should("include", "/profiles/graph.svg");
    cy.get("h1").should("have.text", "Graph");

    cy.get("[data-testid=navigation-schemas]").click();
    cy.url().should("include", "/profiles/");
    cy.get("h1").should("have.text", "Schemas");

    // Test Data submenus.
    cy.get("[data-testid=navigation-data]").click();

    cy.get("[data-testid=navigation-datasets]").click();
    cy.url().should("include", "/search/?type=MeasurementSet");
    cy.get("h1").should("exist"); // Actual title depends on data

    cy.get("[data-testid=navigation-files]").click();
    cy.url().should("include", "/search/?type=File");
    cy.get("h1").should("exist"); // Actual title depends on data

    // Test Methodology submenus. Add to this once the pages these submenus link to exist.
    cy.get("[data-testid=navigation-methodology]").click();

    // Test About submenus.
    cy.get("[data-testid=navigation-about]").click();

    cy.get("[data-testid=navigation-help]").click();
    cy.url().should("include", "/help");
    cy.get("h1").should("exist"); // Actual title depends on data
  });

  it("should load every schema's list and report page", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the schemas page.
    cy.get(`[data-testid="navigation-data-model"]`).click();
    cy.get(`[data-testid="navigation-schemas"]`).click();

    // Collect up all the list view links for every schema.
    const listHrefs = [];
    cy.get(`[data-testid^="schema-"`).each(($schema) => {
      const href = $schema
        .find(`[aria-label^="List view of all"]`)
        .attr("href");
      listHrefs.push(href);
    });

    // Visit each list page to make sure it comes up, then go back to the schema page.
    cy.then(() => {
      listHrefs.forEach((href) => {
        cy.get(`a[href="${href}"]`).click();
        cy.wait(500);
        cy.get("h1").should("exist");
        cy.get(`[data-testid="navigation-schemas"]`).click();
      });
    });

    // Collect up all the report view links for every schema.
    const reportHrefs = [];
    cy.get(`[data-testid^="schema-"`).each(($schema) => {
      const href = $schema
        .find(`[aria-label^="Report view of all"]`)
        .attr("href");
      reportHrefs.push(href);
    });

    // Visit each report page to make sure it comes up, then go back to the schema page.
    cy.then(() => {
      reportHrefs.forEach((href) => {
        cy.get(`a[href="${href}"]`).click();
        cy.wait(500);
        cy.get("h1").should("exist");
        cy.get(`[data-testid="navigation-schemas"]`).click();
      });
    });
  });
});
