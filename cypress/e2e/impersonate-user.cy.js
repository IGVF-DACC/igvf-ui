/// <reference types="cypress" />

describe("Impersonate user tests", () => {
  it("shows the Impersonate User menu item while logged in as an admin", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.get("[data-testid=authenticate]").click();
    cy.get("[data-testid=impersonate]").click();
    cy.url().should("include", "/impersonate-user");

    cy.get("h1").contains("Impersonate User");
    cy.get("[name=filter-users]").should("exist");
    cy.get(`[aria-label^="Impersonate"]`).should("have.length.gte", 10);

    cy.get("[name=filter-users]").focus().type("michael");
    cy.get(`[aria-label^="Impersonate"]`).should("have.length.gte", 4);

    cy.get(`[aria-label^="Impersonate J. Michael Cherry"]`).first().click();
    cy.get("[data-testid=authenticate]").contains("J. Michael Cherry");
    cy.get("[data-testid=authenticate]").click();
    cy.get("[data-testid=impersonate]").should("not.exist");
  });
});
