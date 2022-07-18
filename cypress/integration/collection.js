/// <reference types="cypress" />

describe("collection-view tests", () => {
  it("can select the table view and back to the list view", () => {
    cy.visit("/")
    cy.get("[data-testid=awards]").click()
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1)

    cy.get(`[aria-label="Select collection table view"]`).click()
    cy.get("[data-testid^=collection-list-item-]").should("not.exist")
    cy.get("[role=table]").should("exist")
    cy.get("[role=columnheader]").its("length").should("be.gte", 1)
    cy.get("[role=cell]").its("length").should("be.gte", 1)

    cy.get(`[aria-label="Select collection list view"]`).click()
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1)
    cy.get("[role=table]").should("not.exist")
    cy.get("[role=columnheader]").should("not.exist")
    cy.get("[role=cell]").should("not.exist")
  })

  it("remembers the current list or table view across collection pages", () => {
    cy.visit("/")
    cy.get("[data-testid=awards]").click()
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1)
    cy.get(`[aria-label="Select collection table view"]`).click()
    cy.get("[role=table]").should("exist")

    cy.get("[data-testid=labs]").click()
    cy.get("[data-testid^=collection-list-item-]").should("not.exist")
    cy.get("[role=table]").should("exist")

    cy.get(`[aria-label="Select collection list view"]`).click()
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1)
    cy.get("[role=table]").should("not.exist")

    cy.get("[data-testid=treatments]").click()
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1)
    cy.get("[role=table]").should("not.exist")
  })

  it("lets the user hide and show columns through the modal", () => {
    cy.visit("/")
    cy.get("[data-testid=labs]").click()
    cy.get(`[aria-label="Select collection table view"]`).click()
    cy.get("[role=table]").should("exist")

    cy.contains("Select Hidden Columns").click()
    cy.get("[id^=headlessui-dialog-panel-]").should("exist")

    cy.get("[role=columnheader]").contains("Award")
  })
})
