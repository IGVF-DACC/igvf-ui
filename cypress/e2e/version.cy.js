/// <reference types="cypress" />

describe("Version number display tests", () => {
  it("shows the UI and server versions", () => {
    cy.visit("/");
    cy.get(`[data-testid="help"]`).click();
    cy.url().should("include", "/help");
    cy.get(`[data-testid="version-ui"]`).should("exist");
    cy.get(`[data-testid="version-server"]`).should("exist");
  });
});
