/// <reference types="cypress" />

describe("Test site search", () => {
  it("does a successful search correctly", () => {
    cy.visit("/");

    // Search the site for "cherry" and make sure at least one type section gets displayed.
    cy.get(`[data-testid^="site-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type("cherry{enter}");
    cy.get("h1").contains("Items with “cherry”");
    cy.get(`[data-testid^="site-search-type-section-"]`).should(
      "have.length.least",
      1
    );

    // Check that we can work with the first top-items section.
    cy.get(`[data-testid^="site-search-type-section-"]`)
      .first()
      .within(() => {
        // Expand the first top-items section and make sure it has at least one item.
        cy.get(`[aria-label^="Expand top matches for"]`).click();
        cy.get(`[data-testid^="search-list-item-"]`).should(
          "have.length.least",
          1
        );

        // Collapse the first top-items section and make sure it hides the items.
        cy.get(`[aria-label^="Collapse top matches for"]`).click();
        cy.get(`[data-testid^="search-list-item-"]`).should("have.length", 0);

        // Click the list button and make sure it takes us to the list page.
        cy.get(`[aria-label^="View search list for"]`).click();
        cy.url().should(
          "match",
          /\/search\?type=[a-zA-Z0-9]+&searchTerm=cherry$/
        );
        cy.go("back");

        // Click the list button and make sure it takes us to the list page.
        cy.get(`[aria-label^="View search report for"]`).click();
        cy.url().should(
          "match",
          /\/report\?type=[a-zA-Z0-9]+&searchTerm=cherry$/
        );
      });
  });

  it("does a failed search correctly", () => {
    cy.visit("/");

    // Search the site for "cherry" and make sure the error message gets displayed.
    cy.get(`[data-testid^="site-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type("abcdefg{enter}");
    cy.get("h1").contains("Items with “abcdefg”");
    cy.contains("No matching items to display");
  });

  it("remembers past search terms and lets the user select them", () => {
    cy.visit("/");

    // Search the site for "cherry" and make sure we then go to the site-search page.
    cy.get(`[data-testid^="site-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type("cherry");
    cy.get(`[aria-label="Search for cherry"]`).click();
    cy.get("h1").contains("Items with “cherry”");

    // Go back to the home page, open the search box, and make sure we can select the "human" term.
    cy.visit("/");
    cy.get(`[data-testid^="site-search-trigger"]`).click();
    cy.get(
      `[aria-label="Enter the recent search, cherry, into the search box"]`
    ).click();
    cy.get(`[data-testid="search-input"]`).should("have.value", "cherry");
    cy.get(`[aria-label="Search for cherry"]`).click();
    cy.get("h1").contains("Items with “cherry”");
  });
});

describe("Test ID search", () => {
  it("does a successful ID search correctly", () => {
    cy.visit("/");
    cy.get(`[data-testid="id-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type(
      "860c4750-8d3c-40f5-8f2c-90c5e5d19e88{enter}"
    );
    cy.url().should("include", "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88");
  });

  it("does an unsuccessful ID search correctly", () => {
    cy.visit("/");
    cy.get(`[data-testid="id-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type("abcdefg{enter}");
    cy.contains("No item with the identifier “abcdefg” to display");
  });

  it("remembers past search terms and lets the user select them", () => {
    cy.visit("/");

    // Search the site for a UUID and make sure we then go to that object's page.
    cy.get(`[data-testid^="id-search-trigger"]`).click();
    cy.get(`[data-testid="search-input"]`).type(
      "860c4750-8d3c-40f5-8f2c-90c5e5d19e88{enter}"
    );
    cy.url().should("include", "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88");

    // Go back to the home page, open the ID search box, and make sure we can select the UUID.
    cy.visit("/");
    cy.get(`[data-testid^="id-search-trigger"]`).click();
    cy.get(
      `[aria-label="Enter the recent search, 860c4750-8d3c-40f5-8f2c-90c5e5d19e88, into the search box"]`
    ).click();
    cy.get(`[data-testid="search-input"]`).should(
      "have.value",
      "860c4750-8d3c-40f5-8f2c-90c5e5d19e88"
    );
    cy.get(
      `[aria-label="Search for 860c4750-8d3c-40f5-8f2c-90c5e5d19e88"]`
    ).click();
    cy.url().should("include", "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88");
  });
});
