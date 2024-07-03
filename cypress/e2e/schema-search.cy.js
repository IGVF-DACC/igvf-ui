/// <reference types="cypress" />

describe("Test schema name search", () => {
  it("should highlight the correct names when typing a term", () => {
    cy.visit("/");

    // Go to the schemas page.
    cy.get(`[data-testid="navigation-data-model"]`).click();
    cy.get(`[data-testid="navigation-schemas"]`).click();

    // Type "profile" into the search box.
    cy.get(`[aria-label="Search schema titles"]`).click();
    cy.get("#schema-search").type("analysis");

    // We should see exactly two highlighted schema names.
    cy.get(".bg-schema-name-highlight").should("have.length", 3);

    // Click the first highlighted element and make sure the resulting URL does not have a hash tag.
    cy.get(".bg-schema-name-highlight").first().click();
    cy.url().should("not.contain", "#");

    // Go back to the schema directory page with the Schema Directory button.
    cy.get(`[aria-label="Back to schema directory"]`).click();
    cy.url().should("not.contain", "#");
    cy.get("#schema-search").should("have.value", "");
    cy.get(`[aria-label="Search schema titles"]`).should(
      "have.attr",
      "aria-checked",
      "true"
    );
  });
});

describe("Test schema property search", () => {
  it("should highlight the correct schema titles and link to the correct schema pages", () => {
    cy.visit("/");

    // Go to the schemas page.
    cy.get(`[data-testid="navigation-data-model"]`).click();
    cy.get(`[data-testid="navigation-schemas"]`).click();

    cy.get(`[aria-label="Search schema properties"]`).click();
    cy.get("#schema-search").type("guide");

    // Should see at least two highlighted schema names.
    cy.get(".bg-schema-name-highlight").should("have.length.gte", 2);

    // Click the first highlighted element and make sure the resulting URL has a hash tag with
    // #guide and the search field contains `guide`.
    cy.get(".bg-schema-name-highlight").first().click();
    cy.url().should("contain", "#guide");
    cy.get("#schema-search").should("have.value", "guide");

    // Make sure at least two schema properties are highlighted.
    cy.get(".bg-schema-name-highlight").should("have.length.gte", 2);

    // Return to schema directory and make sure the search field contains `guide` and the URL
    // contains `#guide`.
    cy.get(`[aria-label="Back to schema directory"]`).click();
    cy.url().should("contain", "#guide");
    cy.get("#schema-search").should("have.value", "guide");
  });
});
