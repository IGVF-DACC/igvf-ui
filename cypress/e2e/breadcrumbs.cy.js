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
    cy.get("[data-testid=navigation-data]").click();
    cy.get("[data-testid=navigation-datasets]").click();
    cy.get(`[aria-label^="View details for"]`).eq(0).click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/search/?type=MeasurementSet']").should(
      "have.text",
      "Measurement Set"
    );
  });

  it("shows a two-element breadcrumb on the schema directory page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/profiles']").should("have.text", "Schema Directory");
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
    cy.get("[data-testid='/profiles']").should("have.text", "Schema Directory");
    cy.get("[data-testid='/profiles/award']").should("have.text", "Grant");
  });
});
