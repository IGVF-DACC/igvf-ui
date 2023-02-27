/// <reference types="cypress" />

describe("edit and object", () => {
  it("can edit an object and then save", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.visit("/labs/j-michael-cherry");
  });
});