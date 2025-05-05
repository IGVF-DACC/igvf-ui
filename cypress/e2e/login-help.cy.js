/// <reference types="cypress" />

describe("Make sure the login help appears in the correct situations", () => {
  it("shows the login help text when viewing a protected page while signed out", () => {
    cy.visit("/documents/c7870a38-4286-42fc-9551-22436306e22a/");
    cy.contains("Access was denied to this resource");
    cy.contains("Please sign in if you are affiliated with the IGVF project");
  });

  it("shows the login help when viewing no search results while signed out", () => {
    cy.visit("/search/?type=File&accession=INVALID");
    cy.contains("No list items to display");
    cy.contains("Please sign in if you believe you should see list items");
  });

  it("does not show the login help when viewing no search results while signed in", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.visit("/search/?type=File&accession=INVALID");
    cy.contains("No list items to display");
    cy.contains(
      "Please sign in if you believe you should see list items"
    ).should("not.exist");
  });

  it("shows the login help when viewing no site-search results while signed out", () => {
    cy.visit("/site-search/?query=abcdefg");
    cy.contains("No matching items to display");
    cy.contains("Please sign in if you believe you should see matching items");
  });

  it("does not show the login help when viewing no site-search results while signed in", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.visit("/site-search/?query=abcdefg");
    cy.contains("No matching items to display");
    cy.contains(
      "Please sign in if you believe you should see matching items"
    ).should("not.exist");
  });

  it("shows the login help when viewing no id search results while signed out", () => {
    cy.visit("/");
    cy.get(`[data-testid="id-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type("abcdefg{enter}");
    cy.contains("No items with the identifier abcdefg to display");
    cy.contains(
      "Please sign in if you believe you should see items with the identifier abcdefg"
    );
  });

  it("does not show the login help when viewing no id search results while signed in", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.get(`[data-testid="id-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type("abcdefg{enter}");
    cy.contains("No items with the identifier abcdefg to display");
    cy.contains("Please sign in").should("not.exist");
  });
});
