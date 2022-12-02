/// <reference types="cypress" />

describe("collection-view tests", () => {
  it("can select the table view and back to the list view", () => {
    cy.visit("/");
    cy.get("[data-testid=awards]").click();
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1);

    cy.get(`[aria-label="Select collection table view"]`).click();
    cy.get("[data-testid^=collection-list-item-]").should("not.exist");
    cy.get("[role=table]").should("exist");
    cy.get("[role=columnheader]").its("length").should("be.gte", 1);
    cy.get("[role=cell]").its("length").should("be.gte", 1);

    cy.get(`[aria-label="Select collection list view"]`).click();
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1);
    cy.get("[role=table]").should("not.exist");
    cy.get("[role=columnheader]").should("not.exist");
    cy.get("[role=cell]").should("not.exist");
  });

  it("remembers the current list or table view across collection pages", () => {
    cy.visit("/");
    cy.get("[data-testid=awards]").click();
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1);
    cy.get(`[aria-label="Select collection table view"]`).click();
    cy.get("[role=table]").should("exist");

    cy.get("[data-testid=labs]").click();
    cy.get("[data-testid^=collection-list-item-]").should("not.exist");
    cy.get("[role=table]").should("exist");

    cy.get(`[aria-label="Select collection list view"]`).click();
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1);
    cy.get("[role=table]").should("not.exist");

    cy.get("[data-testid=treatments]").click();
    cy.get("[data-testid^=collection-list-item-]")
      .its("length")
      .should("be.gte", 1);
    cy.get("[role=table]").should("not.exist");
  });

  it("lets the user hide and show columns through the modal", () => {
    cy.visit("/");
    cy.get("[data-testid=labs]").click();
    cy.get(`[aria-label="Select collection table view"]`).click();
    cy.get("[role=table]").should("exist");

    cy.contains("Show / Hide Columns").click();
    cy.get("[id^=headlessui-dialog-panel-]").should("exist");

    cy.get("[role=columnheader]").contains("Award").should("exist");
    cy.get("input[name=awards]").uncheck();
    cy.get("[role=columnheader]").contains("Award").should("not.exist");
    cy.get("input[name=awards]").check();
    cy.get("[role=columnheader]").contains("Award").should("exist");
    cy.get("input[name=aliases]").uncheck();
    cy.get("[role=columnheader]").contains("Aliases").should("not.exist");
    cy.wait(1000);

    cy.reloadWithDelay();
    cy.get(`[aria-label="Select collection table view"]`).click();
    cy.get("[role=columnheader]").contains("Aliases").should("not.exist");

    cy.contains("Show / Hide Columns").click();
    cy.contains("Hide All Columns").click();
    cy.get("[role=columnheader]").should("have.length", 1);
    cy.get("[role=columnheader]").contains("ID").should("exist");
    cy.get("fieldset input[type=checkbox]").each((checkbox) => {
      expect(checkbox[0].checked).to.equal(false);
    });

    cy.contains("Show All Columns").click();
    cy.get("[role=columnheader]").should("have.length.greaterThan", 1);
    cy.get("fieldset input[type=checkbox]").each((checkbox) => {
      expect(checkbox[0].checked).to.equal(true);
    });
  });

  it("copies a correct URL for the hidden columns", () => {
    cy.visit("/");
    cy.get("[data-testid=treatments]").click();
    cy.get(`[aria-label="Select collection table view"]`).click();
    cy.contains("Show / Hide Columns").click();
    cy.get("input[name=aliases]").uncheck();
    cy.get("input[name=lot_id]").uncheck();
    cy.contains("Close").click();
    cy.wait(1000);
    cy.contains("Copy URL Columns").click();
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((text) => {
        expect(text).to.contain("/treatments#hidden=aliases,lot_id");
      });
    });
  });

  it("responds to the columns URL by showing and hiding the correct columns", () => {
    cy.reloadWithDelay();
    cy.visit("/treatments#hidden=aliases,lot_id");
    cy.get("[data-testid^=collection-list-item-]").should("not.exist");
    cy.get("[role=table]").should("exist");

    cy.get("[role=columnheader]").should("have.length.greaterThan", 1);
    cy.get("[role=columnheader]").contains("Aliases").should("not.exist");
    cy.get("[role=columnheader]").contains("Lot ID").should("not.exist");

    cy.contains("Clear URL Columns").click();
    cy.url().should("not.include", "#hidden=aliases,lot_id");
    cy.contains("Save URL Columns to Browser").should("not.exist");
    cy.contains("Clear URL Columns").should("not.exist");
    cy.contains("Show / Hide Columns").should("exist");
    cy.contains("Copy URL Columns").should("exist");
  });

  it("overwrites the browser-saved columns with the URL columns", () => {
    cy.visit("/");
    cy.get("[data-testid=treatments]").click();
    cy.get(`[aria-label="Select collection table view"]`).click();
    cy.contains("Show / Hide Columns").click();

    cy.get("input[name=amount]").uncheck();
    cy.get("input[name=amount_units]").uncheck();
    cy.wait(1000);

    cy.visit("/treatments#hidden=aliases,lot_id");
    cy.reloadWithDelay();
    cy.get("[role=columnheader]").contains("Aliases").should("not.exist");
    cy.get("[role=columnheader]").contains("Lot ID").should("not.exist");
    cy.get("[role=columnheader]").contains("Amount").should("exist");
    cy.get("[role=columnheader]").contains("Amount Units").should("exist");

    cy.contains("Save URL Columns to Browser").click();
    cy.url().should("not.include", "#hidden=aliases,lot_id");
    cy.get("[role=columnheader]").contains("Aliases").should("not.exist");
    cy.get("[role=columnheader]").contains("Lot ID").should("not.exist");
    cy.get("[role=columnheader]").contains("Amount").should("exist");
    cy.get("[role=columnheader]").contains("Amount Units").should("exist");
  });
});
