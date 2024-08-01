/// <reference types="cypress" />

describe("Breadcrumb tests", () => {
  it("shows a two-element breadcrumb on a search-results page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data]").click();
    cy.get("[data-testid=navigation-files").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='breadcrumb-0']").should("have.text", "Home");
    cy.get("[data-testid='breadcrumb-1']").should("have.text", "Files");
  });

  it("shows a three-element breadcrumb on an object page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data]").click();
    cy.get("[data-testid=navigation-raw-datasets]").click();
    cy.get(`[aria-label^="View details for"]`).eq(0).click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='breadcrumb-0']").should("have.text", "Home");
    cy.get("[data-testid='breadcrumb-1']").should(
      "have.text",
      "Measurement Sets"
    );
  });

  it("shows a two-element breadcrumb on the schema directory page", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='breadcrumb-0']").should("have.text", "Home");
    cy.get("[data-testid='breadcrumb-1']").should(
      "have.text",
      "Schema Directory"
    );
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
    cy.get("[data-testid='breadcrumb-0']").should("have.text", "Home");
    cy.get("[data-testid='breadcrumb-1']").should(
      "have.text",
      "Schema Directory"
    );
    cy.get("[data-testid='breadcrumb-2']").should("have.text", "Grant");
  });
});
