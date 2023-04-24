/// <reference types="cypress" />

describe("Test Help directory page", () => {
  it("has the correct number of categories and subcategories", () => {
    cy.visit("/");
    cy.get("[data-testid=help]").click();
    cy.url().should("include", "/help");
    cy.get(`[data-testid^="category-title-"]`).should("have.length", 3);

    // Make sure each category has the correct number of subcategories. Change the "have.length"
    // values if the help-page test data changes.
    cy.get(`[data-testid^="category-title-"]`).each(($el, index) => {
      cy.get($el).within($el, () => {
        switch (index) {
          case 0:
            cy.get(`[data-testid^="subcategory-title-"]`).should(
              "have.length",
              0
            );
            break;
          case 1:
            cy.get(`[data-testid^="subcategory-title-"]`).should(
              "have.length",
              2
            );
            break;
          case 2:
            cy.get(`[data-testid^="subcategory-title-"]`).should(
              "have.length",
              2
            );
            break;
          default:
            break;
        }
      });
    });
  });
});
