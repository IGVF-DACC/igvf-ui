/// <reference types="cypress" />

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
});
