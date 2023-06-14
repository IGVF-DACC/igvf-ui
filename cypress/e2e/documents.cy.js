/// <reference types="cypress" />

describe("Must sign in to see current document objects", () => {
  it("It should sign in through auth0", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[href="/search?type=Document"]`).click();

    // Go to the first document in the list and go to its document object page.
    cy.get(`[data-testid^="search-list-item-"]`)
      .first()
      .find("a")
      .first()
      .click();

    // Make sure the document object page has a link to download the attachment.
    cy.url().should(
      "match",
      /http:\/\/localhost:3000\/documents\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/
    );
    cy.get("[aria-label^=Download]");

    // Go to a treatment with documents and make sure the document table appears.
    cy.visit(
      "http://localhost:3000/treatments/10c05ac0-52a2-11e6-bdf4-0800200c9a66"
    );
    cy.contains("Cypress Testing");
    cy.get("[role=table]").find("[aria-label^=Download]");
  });
});
