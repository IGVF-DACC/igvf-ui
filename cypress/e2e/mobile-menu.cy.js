/// <reference types="cypress" />

describe("Mobile menu tests", () => {
  it("should open and close the mobile menu", () => {
    cy.visit("/");
    cy.viewport("iphone-xr");

    // The mobile menu should not exist, then open when the user clicks the navigation trigger.
    cy.get("[data-testid='mobile-navigation']").should("not.exist");
    cy.get("[data-testid='mobile-navigation-trigger']").click();
    cy.get("[data-testid='mobile-navigation']").should("be.visible");

    // Selecting a mobile navigation item should close the menu.
    cy.get("[data-testid=navigation-data-model]").eq(1).click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get("[data-testid='mobile-navigation']").should("not.exist");
  });
});
