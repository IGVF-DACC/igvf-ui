/// <reference types="cypress" />

describe("Content-Change Tests", () => {
  it("tests the delete buttons only appear when more than one block exists", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the page titled `Samples`.
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[href="/search/?type=Page"]`).click();
    cy.get("#items-per-page").select("300 Items");
    cy.get(`[aria-label="View details for /test-section/subpage/"]`).click();
    cy.contains("Edit Page").click();
    cy.get("#block1").type("{enter}{enter}Updated content.");

    // Make sure no Delete Block buttons appear when only one block exists.
    cy.get(`[aria-label="Delete block"]`).should("not.exist");

    // Make sure the Delete Block button appears under each block when more than one block exists.
    cy.get(`[aria-label="Add block below this block"]`).click();
    cy.get(`[aria-label="Delete block"]`).should("have.length", 2);

    // Delete the second block and make sure the page reacts correctly.
    cy.get(`[aria-label="Delete block"]`).eq(1).click();
    cy.get("#confirm-delete-block").click();
    cy.get("textarea").should("have.length", 1);
    cy.get(`[aria-label="Delete block"]`).should("not.exist");
  });

  it("should let you change the metadata of a page", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(2000);

    // Make a new top-level page.
    const now = new Date().getTime();
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[aria-label="Add Page"]`).click();
    cy.get("#block1").type("Test content.");
    cy.get("#name").type(`test-page-${now}`);
    cy.get("#title").type(`Test Page ${now}`);
    cy.get("#status").select("In Progress");
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).should("not.exist");
    cy.delayForIndexing();

    // Change the new page's title, status, and parent and make sure those changes stick.
    cy.visit(`/search/?type=Page&limit=300`);
    cy.get(`[aria-label="View details for /test-page-${now}/"]`).click();
    cy.contains("Edit Page").click();
    cy.get("#title").clear();
    cy.get("#title").type(`Updated Test Page ${now}`);
    cy.get("#status").select("Released");
    cy.get(`[aria-label="Parent test-section list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.visit("/search/?type=Page&limit=300");
    cy.get(
      `[data-testid="search-list-item-/test-section/test-page-${now}/"]`
    ).within(() => {
      cy.contains("Updated Test Page");
      cy.contains("released");
    });
  });
});
