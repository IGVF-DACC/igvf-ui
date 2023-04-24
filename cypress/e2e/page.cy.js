/// <reference types="cypress" />

describe("Content-Change Tests", () => {
  it("should let you change and save the contents of a page", () => {
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the page titled `Samples`.
    cy.get(`[data-testid="pages"]`).click();
    cy.get(`[aria-label="View details for /test-section/subpage/"]`).click();
    cy.contains("Edit Page").click();
    cy.get("#block1").type("{enter}{enter}Updated content.");

    // Make sure no Delete Block buttons appear when only one block exists.
    cy.get(`[aria-label="Delete block"]`).should("not.exist");

    // Make sure the Delete Block button appears under each block when more than one block exists.
    cy.get(`[aria-label="Add block below this block"]`).click();
    cy.get(`[aria-label="Delete block"]`).should("have.length", 2);

    // Change the new block to the component type, set it to the SAMPLE_COUNT component, and save
    // the page.
    cy.get("#block2-type").select("Component");
    cy.get("#block2").type("SAMPLE_COUNT{enter}label=Sample Count");
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.contains("Updated content.");
    cy.contains("Sample Count");

    // Delete the second block and make sure the page reacts correctly.
    cy.contains("Edit Page").click();
    cy.get(`[aria-label="Delete block"]`).should("have.length", 2);
    cy.get(`[aria-label="Delete block"]`).eq(1).click();
    cy.get("#confirm-delete-block").click();
    cy.get("textarea").should("have.length", 1);
    cy.get(`[aria-label="Delete block"]`).should("not.exist");
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.contains("Sample Count").should("not.exist");
  });

  it("should let you change the metadata of a page", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(2000);

    cy.visit("/test-section/subpage-in-progress#!edit");
    cy.get("#title").clear();
    cy.get("#title").type("Updated Subpage Title");
    cy.get("#status").select("Released");
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.visit("/search?type=Page");
    cy.get(
      `[data-testid="search-list-item-/test-section/subpage-in-progress/"]`
    ).within(() => {
      cy.contains("Updated Subpage Title");
      cy.contains("released");
    });
  });

  it("should let you change the page hierarchy", () => {
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Change the name of the page and verify its URL changes.
    cy.visit("/test-section/subpage#!edit");
    cy.get("#name").clear();
    cy.get("#name").type("new-subpage");
    cy.get(`[aria-label="Save edits to page"]`);
    cy.contains("Save").click();
    cy.delayForIndexing();
    cy.url().should("include", "/test-section/new-subpage");

    // Change the page's parent and verify its URL changes.
    cy.contains("Edit Page").click();
    cy.get(`[aria-label="Parent testpage list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.url().should("include", "/testpage/new-subpage");
  });

  it("should update the help page when you add new help pages", () => {
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1500);

    // Make a new top-level help page.
    cy.get("[data-testid=profiles]").click();
    cy.get(`[label="Add Page"]`).click();
    cy.get("#block1").type("Test Help Category");
    cy.get("#name").type("test-help-category");
    cy.get("#title").type("Test Help Category");
    cy.get(`[aria-label="Parent help list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.get(`[aria-label="Save edits to page"]`).should("not.exist");

    // Make sure the new top-level help page appears as a category on the help page.
    cy.get(`[data-testid="help"]`).click();
    cy.get("h2").should("contain", "Test Help Category");

    // Make a new top-level help page.
    cy.get("[data-testid=profiles]").click();
    cy.get(`[label="Add Page"]`).click();
    cy.get("#block1").type("Help Content Page");
    cy.get("#name").type("help-content");
    cy.get("#title").type("Help Content");
    cy.get(`[aria-label="Parent test-help-category list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.delayForIndexing();
    cy.get(`[aria-label="Save edits to page"]`).should("not.exist");

    // Make sure the new help page appears as a regular help page.
    cy.get(`[data-testid="help"]`).click();
    cy.get("a").should("contain", "Help Content");
  });
});
