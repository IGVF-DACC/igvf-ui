/// <reference types="cypress" />

describe("Mobile menu tests", () => {
  it("shows a two-element breadcrumb on a search-results page", () => {
    cy.visit("/");
    cy.get("[data-testid=awards]").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/search/?type=Award']").should("have.text", "Grant");
  });

  it("shows a three-element breadcrumb on an object page", () => {
    cy.visit("/");
    cy.get("[data-testid=awards]").click();
    cy.get("[data-testid=search-list]").should("exist");
    cy.get("[aria-label='View details for /awards/1U01HG012103-01/']").click();

    cy.contains("h1", "1U01HG012103-01");

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/search?type=Award']").should("have.text", "Grant");
    cy.get("[data-testid='/awards/1U01HG012103-01/']").should(
      "have.text",
      "1U01HG012103-01"
    );
  });

  it("shows a two-element breadcrumb on the schema directory page", () => {
    cy.visit("/");
    cy.get("[data-testid=profiles]").click();

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/profiles']").should("have.text", "Schemas");
  });

  it("shows a three-element breadcrumb on an individual schema page", () => {
    cy.visit("/");
    cy.get("[data-testid=profiles]").click();
    cy.get("a").contains("Award").click();

    cy.contains("h1", "Grant");

    cy.get("[aria-label='breadcrumbs']").should("exist");
    cy.get("[data-testid='/']").should("have.text", "Home");
    cy.get("[data-testid='/profiles']").should("have.text", "Schemas");
    cy.get("[data-testid='/profiles/award']").should("have.text", "Grant");
  });
});
