/// <reference types="cypress" />

describe("Test object history", () => {
  it("Edit Page shows correct title for object", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the schemas page, click the list view for measurement sets, then click the first
    // measurement set.
    cy.get(`[data-testid="navigation-data-model"]`).click();
    cy.get(`[data-testid="navigation-schemas"]`).click();
    cy.get(`[aria-label="List view of all Measurement Sets objects"]`).click();
    cy.get("ul[data-testid=search-list] li:first a").click();

    // Click the object-history button and make sure the URL is correct.
    cy.get("a[aria-label='See object history']").click();
    cy.url().should("match", /@@history\/$/);

    // Make sure the h1 title starts with "History:".
    cy.get("h1")
      .invoke("text")
      .should("match", /^History: /);

    // Make sure the current object is displayed.
    cy.get("div[data-testid=history-current]").should("exist");

    // Make sure exactly one history entry exists and it is not expanded.
    cy.get("div[data-testid^=history-entry-]").should("have.length", 1);
    cy.get("button[aria-expanded=false]").should("exist");

    // Click the expand button and make sure the entry is expanded.
    cy.get("button[aria-expanded=false]").click();
    cy.get("button[aria-expanded=true]").should("exist");

    // Click the expand button again and make sure the entry is not expanded.
    cy.get("button[aria-expanded=true]").click();
    cy.get("button[aria-expanded=false]").should("exist");

    // Click the history button and make sure it returns to the original object.
    cy.get("a[aria-label='See object']").click();
    cy.url().should("not.match", /@@history\/$/);
  });
});
