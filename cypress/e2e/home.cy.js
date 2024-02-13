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
  });
});
