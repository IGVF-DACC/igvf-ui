/// <reference types="cypress" />

/**
 * Text to put into the JSON editor.
 */
const json = `{
  "status": "current",
  "url": "http://verygood.university.edu",
  "submitter_comment": "A very good lab in my opinion",
  "description": "Very Good Lab at Very Good University",
  "name": "lab-${Date.now()}",
  "pi": "/users/4a63f82a-2e25-4790-bfcc-d183f8ca8869/",
  "institute_label": "Very Good University"
`;

describe("Test Add button", () => {
  it("Profiles Page has buttons, can create object", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");

    cy.visit("/profiles/");
    cy.get("a[href='/lab/#!add']").should("exist").click();

    // After the div for the JSON editor appears in the DOM, reload the page. Without this, the ACE
    // editor does not initialize properly, and the test fails.
    cy.url().should("include", "/lab/#!add");
    cy.get('[id="JSON Editor"]', { timeout: 30000 }).should("exist");
    cy.reloadWithDelay(5000);

    // Now check for ACE editor line content to appear.
    cy.get("#JSON\\ Editor .ace_line", { timeout: 10000 }).should("be.visible");

    // The ACE editor doesn't use the textarea for text input, so we need to clear it using its API.
    cy.window().then((win) => {
      const editor = win.ace.edit("JSON Editor");
      editor.setValue("", -1);
      cy.wait(1000);
    });

    // Enter some JSON into the editor. Have to use force: true because the editor is not visible
    // when the page is first loaded.
    cy.get("textarea").type(json, { force: true });
    cy.wait(1000);

    // Save the object to make the page appear. Then make sure its title matches the name in the
    // JSON.
    cy.get("button").contains("Save").click();
    cy.get("h1").contains("Cypress Testing, Very Good University");
  });
});
