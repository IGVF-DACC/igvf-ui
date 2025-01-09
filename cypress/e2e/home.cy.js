/// <reference types="cypress" />

describe("Home page", () => {
  it("should show the home-page chart", () => {
    // The home-page chart disappears at narrow viewport widths, so use a wider viewport than the
    // default for Cypress.
    cy.viewport("macbook-13");
    cy.visit("/");

    // At least five bar elements in the default "processed" chart.
    cy.get('[id^="bar-"]').should("have.length.greaterThan", 2);

    // The "predictions" tab should have the title "Released Predictions Datasets".
    cy.get("#tab-predictions").should(
      "have.text",
      "Released Predictions Datasets"
    );
    cy.get("#tab-predictions").click();
    cy.get('[id^="bar-"]').should("have.length.greaterThan", 2);

    // The "raw" tab should have the title "Released Raw Datasets".
    cy.get("#tab-raw").should("have.text", "Released Raw Datasets");
    cy.get("#tab-raw").click();
    cy.get('[id^="bar-"]').should("have.length.greaterThan", 2);

    // The "processed" tab should have the title "Released Processed Datasets".
    cy.get("#tab-processed").should("have.text", "Released Processed Datasets");
    cy.get("#tab-processed").click();
    cy.get('[id^="bar-"]').should("have.length.greaterThan", 2);
  });
});
