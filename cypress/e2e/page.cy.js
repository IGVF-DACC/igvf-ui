/// <reference types="cypress" />

describe("Content-Change Tests", () => {
  it("should let you change and save the contents of a page", () => {
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the page titled `Samples`.
    cy.get(`[data-testid="pages"]`).click();
    cy.get(
      `[data-testid="collection-list-item-331928f7-d8f7-4ea6-b4e0-8d380fb22974"]`
    ).within(() => {
      cy.get("a").click();
    });
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
    cy.contains("Sample Count").should("not.exist");
  });

  it("should let you change the metadata of a page", () => {
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.visit("/test-section/subpage-in-progress#!edit");
    cy.get("#title").clear().type("Updated Subpage Title");
    cy.get("#status").select("Released");
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.wait(1000);
    cy.visit("/pages/");
    cy.get(
      `[data-testid="collection-list-item-83173355-31ff-4ca7-a259-e4af0f3a0169"]`
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
    cy.get("#name").clear().type("new-subpage");
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.url().should("include", "/test-section/new-subpage");

    // Change the page's parent and verify its URL changes.
    cy.contains("Edit Page").click();
    cy.get(`[aria-label="Parent testpage list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();
    cy.url().should("include", "/testpage/new-subpage");
  });

  it("should update the help page when you add new help pages", () => {
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Make a new top-level help page.
    cy.visit("/pages");
    cy.contains("Add Page").click();
    cy.get("#block1").type("Test Help Category");
    cy.get("#name").type("test-help-category");
    cy.get("#title").type("Test Help Category");
    cy.get(`[aria-label="Parent help list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();

    // Make sure the new top-level help page appears as a category on the help page.
    cy.get(`[data-testid="help"]`).click();
    cy.get("h2").should("contain", "Test Help Category");

    // Make a new top-level help page.
    cy.visit("/pages");
    cy.contains("Add Page").click();
    cy.get("#block1").type("Help Content Page");
    cy.get("#name").type("help-content");
    cy.get("#title").type("Help Content");
    cy.get(`[aria-label="Parent test-help-category list item"]`).click();
    cy.get(`[aria-label="Save edits to page"]`).click();

    // Make sure the new help page appears as a regular help page.
    cy.get(`[data-testid="help"]`).click();
    cy.get("a").should("contain", "Help Content");
  });
});
