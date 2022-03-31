/// <reference types="cypress" />

describe("Mobile menu tests", () => {
  it("shows a two-element breadcrumb on a collection page", () => {
    cy.visit("/")
    cy.get("[data-testid=awards]").click()

    cy.get("[aria-label='breadcrumbs']").should("exist")
    cy.get("[aria-label='breadcrumbs']").find("a").should("have.length", 1)
    cy.get("[aria-label='breadcrumbs']").find("a").should("have.text", "Home")
  })

  it("shows a three-element breadcrumb on a collection page", () => {
    cy.visit("/")
    cy.get("[data-testid=awards]").click()
    cy.get("[aria-label='Award HG012012']").click()

    // Wait for the individual award page to load.
    cy.location("pathname", { timeout: 10000 }).should("eq", "/awards/HG012012")

    cy.get("[aria-label='breadcrumbs']").should("exist")
    cy.get("[aria-label='breadcrumbs']").find("a").its("length").should("eq", 2)
    cy.get("[aria-label='breadcrumbs']")
      .find("a")
      .eq(0)
      .should("have.text", "Home")
    cy.get("[aria-label='breadcrumbs']")
      .find("a")
      .eq(1)
      .should("have.text", "Awards (Grants)")
  })
})
