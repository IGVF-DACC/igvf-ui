/// <reference types="cypress" />

describe("Breadcrumb tests", () => {
  it("shows a two-element breadcrumb on a search-results page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data]").click();
    cy.get("[data-testid=navigation-files").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/search/?type=File']").should("have.text", "File");
  });

  it("shows a three-element breadcrumb on an object page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-methodology]").click();
    cy.get("[data-testid=navigation-genome-references]").click();
    cy.get(`[aria-label^="View details for"]`).click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/search?type=CuratedSet']").should(
      "have.text",
      "Curated Set"
    );
    cy.get("[data-testid='/curated-sets/IGVFDS0000AAAA/']").should(
      "have.text",
      "IGVFDS0000AAAA"
    );
  });

  it("shows a two-element breadcrumb on the schema directory page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/profiles']").should("have.text", "Schemas");
  });

  it("shows a three-element breadcrumb on an individual schema page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[data-testid="schema-awards-grants"]`)
      .contains("Awards (Grants)")
      .click();

    cy.contains("h1", "Grant");

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/profiles']").should("have.text", "Schemas");
    cy.get("[data-testid='/profiles/award']").should("have.text", "Grant");
  });
});
