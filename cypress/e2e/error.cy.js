/// <reference types="cypress" />

describe("Test 404 page", () => {
  it("shows a 404 page with an unknown path", () => {
    cy.visit("/this-is-not-a-valid-path", { failOnStatusCode: false });
    cy.contains("404");
    cy.contains("This page could not be found");
  });
});
