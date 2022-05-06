/// <reference types="cypress" />

describe("Navigation", () => {
  it("should navigate to other pages from the home page", () => {
    cy.visit("/")

    // Make sure all the navigation links work.
    cy.get("[data-testid=awards]").click()
    cy.url().should("include", "/awards")
    cy.get("[data-testid=cell-lines]").click()
    cy.url().should("include", "/cell-lines")
    cy.get("[data-testid=labs]").click()
    cy.url().should("include", "/labs")
    cy.get("[data-testid=technical-samples]").click()
    cy.url().should("include", "/technical-samples")
    cy.get("[data-testid=treatments]").click()
    cy.url().should("include", "/treatments")
    cy.get("[data-testid=users]").click()
    cy.url().should("include", "/users")
  })
})
