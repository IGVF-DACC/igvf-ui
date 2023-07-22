/// <reference types="cypress" />

describe("Test Add button", () => {
  it("Profiles Page has buttons, can create object", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    cy.visit("/profiles/");
    cy.wait(500);

    cy.get("a[href='/lab#!add']").should("exist").click();

    cy.get('[id="JSON Editor"]').should("exist");

    cy.wait(2000);

    const t = new Date().getTime();
    cy.get("textarea")
      .focus()
      .clear()
      .type("{\n")
      .type('"status": "current",\n')
      .type('"url": "http://verygood.university.edu",\n')
      .type('"submitter_comment": "A very good lab in my opinion",\n')
      .type('"description": "Very Good Lab at Very Good University",\n')
      .type(`"name": "lab-${t}",\n`)
      // This is the cypress user
      .type('"pi": "/users/4a63f82a-2e25-4790-bfcc-d183f8ca8869/",\n')
      .type('"institute_label": "Very Good University"');
    cy.contains("http://verygood.university.edu").should("exist");
    cy.get("button").contains("Save").click();
    cy.get("h1").contains("Cypress Testing, Very Good University");
  });
});
