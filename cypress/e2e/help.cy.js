/// <reference types="cypress" />

describe("Test Help directory page", () => {
  it("has the correct number of categories and subcategories", () => {
    cy.visit("/");
    cy.get("[data-testid=navigation-about]").click();
    cy.get("[data-testid=navigation-help]").click();
    cy.url().should("include", "/help");
    cy.get(`[data-testid^="category-title-"]`).should("have.length", 3);
  });
});
