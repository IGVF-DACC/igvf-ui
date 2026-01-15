/// <reference types="cypress" />

describe("Path redirection", () => {
  it("loads pages without the object type in the path", () => {
    cy.visit("/IGVFDS5575ANST/");
    cy.url().should("include", "/analysis-sets/IGVFDS5575ANST/");
    cy.get("h1").should("contain.text", "IGVFDS5575ANST");

    cy.visit("/igvf:basic_construct_library_set_0/");
    cy.url().should("include", "/construct-library-sets/IGVFDS5436ABCD/");
    cy.get("h1").should("contain.text", "IGVFDS5436ABCD");
  });

  it("loads pages with the incorrect object type in the path", () => {
    cy.visit("/in-vitro-systems/IGVFDS5575ANST/");
    cy.url().should("include", "/analysis-sets/IGVFDS5575ANST/");
    cy.get("h1").should("contain.text", "IGVFDS5575ANST");

    cy.visit("/software-versions/igvf:alias_human_donor2/");
    cy.url().should("include", "/human-donors/IGVFDO3983KFST/");
    cy.get("h1").should("contain.text", "IGVFDO3983KFST");
  });
});
