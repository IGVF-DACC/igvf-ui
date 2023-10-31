/// <reference types="cypress" />

describe("Exercise access keys", () => {
  it("It should sign in through auth0", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the user profile page.
    cy.get("[data-testid=navigation-authenticate]").click();
    cy.get("[data-testid=navigation-profile]").click();

    // Create an access key.
    cy.contains("Create Access Key").click();
    cy.contains("Access Key ID").should("exist");
    cy.contains("Access Key Secret").should("exist");
    cy.contains("button", "Close").click();
    cy.delayForIndexing();

    // Should contain a single access key on the display.
    cy.get(`[aria-label^="Reset access key"]`).should("have.length", 1);

    // Reset access key
    cy.get(`[aria-label^="Reset access key"]`).click();
    cy.delayForIndexing();
    cy.contains("Access Key ID").should("exist");
    cy.contains("Access Key Secret").should("exist");
    cy.contains("button", "Close").click();

    // Should contain a single access key on the display.
    cy.get(`[aria-label^="Reset access key"]`).should("have.length", 1);

    // Create a second access key.
    cy.contains("Create Access Key").click();
    cy.contains("Access Key ID").should("exist");
    cy.contains("Access Key Secret").should("exist");
    cy.contains("button", "Close").click();
    cy.delayForIndexing();

    // Should contain two access keys on the display.
    cy.get(`[aria-label^="Reset access key"]`).should("have.length", 2);

    // Delete the first access key.
    cy.get(`[aria-label^="Delete access key"]`).first().click();
    cy.delayForIndexing();
    cy.contains("button", /^Delete$/).click();

    // Should contain one access key on the display.
    cy.get(`[aria-label^="Reset access key"]`).should("have.length", 1);

    // Delete the remaining access key.
    cy.get(`[aria-label^="Delete access key"]`).first().click();
    cy.delayForIndexing();
    cy.contains("button", /^Delete$/).click();

    // Should contain no access keys on the display.
    cy.get(`[aria-label^="Reset access key"]`).should("have.length", 0);

    // Close the user menu.
    cy.get("[data-testid=navigation-authenticate]").click();
  });
});
