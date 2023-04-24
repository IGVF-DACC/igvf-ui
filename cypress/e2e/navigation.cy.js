/// <reference types="cypress" />

describe("Navigation tests", () => {
  it("displays the collapse button and collapses the sidebar on click", () => {
    cy.visit("/");
    cy.get(`[data-testid="nav-collapse-trigger"]`).should("exist");
    cy.get(`[data-testid="nav-collapse-trigger"]`).click();
    cy.get(`[data-testid="nav-collapse-trigger"]`).should("not.exist");
    cy.get(`[data-testid="nav-expand-trigger"]`).should("exist");
    cy.get(`[data-testid="nav-expand-trigger"]`).click();
    cy.get(`[data-testid="nav-expand-trigger"]`).should("not.exist");
    cy.get(`[data-testid="nav-collapse-trigger"]`).should("exist");
  });
});
