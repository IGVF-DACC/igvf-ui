/// <reference types="cypress" />

describe("Home page", () => {
  it("should show the home-page chart", () => {
    // The home-page chart disappears at narrow viewport widths, so use a wider viewport than the
    // default for Cypress.
    cy.viewport("macbook-13");
    cy.visit("/");

    // At least five bar elements in the chart.
    cy.get('[id^="bar-"]').should("have.length.greaterThan", 4);

    // Check the month-selector button opens the month-selector list.
    cy.get("#dropdown-month-selector-ref").should("contain.text", "All");
    cy.get("[data-testid=dropdown-month-selector]").should("not.exist");
    cy.get("#month-selector").click();
    cy.get("[data-testid=dropdown-month-selector]").should("exist");
    cy.get("#month-selector-options button").should(
      "have.length.greaterThan",
      1
    );

    // Click the second button in the month-selector list and make sure it affects the button text.
    cy.get("#month-selector-options button").eq(1).click();
    cy.get("[data-testid=dropdown-month-selector]").should("not.exist");
    cy.get("#dropdown-month-selector-ref").should("not.contain.text", "All");

    // Use the month selector to select "All" and make sure it affects the button text and chart.
    cy.get("#dropdown-month-selector-ref").click();
    cy.get("#All").click();
    cy.get("#dropdown-month-selector-ref").should("contain.text", "All");
  });
});
