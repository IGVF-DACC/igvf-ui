/// <reference types="cypress" />

describe("Navigation", () => {
  it("should navigate to other pages from the home page", () => {
    cy.visit("/")

    // Make sure all the navigation links work.
    cy.get("[data-testid=awards]").click()
    cy.url().should("include", "/awards")

    cy.get("[data-testid=donors]").click()
    cy.get("[data-testid=human-donors]").click()
    cy.url().should("include", "/human-donors")
    cy.get("[data-testid=rodent-donors]").click()
    cy.url().should("include", "/rodent-donors")
    cy.get("[data-testid=donors]").click()
    cy.get("[data-testid=human-donors]").should("not.exist")
    cy.get("[data-testid=rodent-donors]").should("not.exist")

    cy.get("[data-testid=labs]").click()
    cy.url().should("include", "/labs")

    cy.get("[data-testid=samples]").click()
    cy.get("[data-testid=cell-lines]").click()
    cy.url().should("include", "/cell-lines")
    cy.get("[data-testid=differentiated-cells]").click()
    cy.url().should("include", "/differentiated-cells")
    cy.get("[data-testid=differentiated-tissues]").click()
    cy.url().should("include", "/differentiated-tissues")
    cy.get("[data-testid=primary-cells]").click()
    cy.url().should("include", "/primary-cells")
    cy.get("[data-testid=technical-samples]").click()
    cy.url().should("include", "/technical-samples")
    cy.get("[data-testid=tissues]").click()
    cy.url().should("include", "/tissues")
    cy.get("[data-testid=samples]").click()
    cy.get("[data-testid=cell-lines]").should("not.exist")
    cy.get("[data-testid=differentiated-cells]").should("not.exist")
    cy.get("[data-testid=differentiated-tissues]").should("not.exist")
    cy.get("[data-testid=primary-cells]").should("not.exist")
    cy.get("[data-testid=technical-samples]").should("not.exist")
    cy.get("[data-testid=tissues]").should("not.exist")

    cy.get("[data-testid=treatments]").click()
    cy.url().should("include", "/treatments")
    cy.get("[data-testid=users]").click()
    cy.url().should("include", "/users")
  })
})
