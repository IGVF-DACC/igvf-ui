/// <reference types="cypress" />

describe("Must sign in to see current document objects", () => {
  it(
    "It should sign in through auth0",
    {
      defaultCommandTimeout: 30000,
    },
    () => {
      cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
      cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
      cy.contains("Cypress Testing");
      cy.wait(1000);

      // Go to the documents collection page.
      cy.get("[data-testid=documents]").click();
      cy.get(`[data-testid^="search-list-item"]`).should(
        "have.length.at.least",
        1
      );

      // Go to the first document in the list and go to its document object page.
      cy.get(`[data-testid^="search-list-item"]`)
        .first()
        .find("a")
        .first()
        .click();
      cy.url().then((url) => {
        cy.log(url);
      });

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
    }
  );
});
