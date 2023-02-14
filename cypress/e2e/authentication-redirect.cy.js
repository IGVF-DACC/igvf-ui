describe("Test that the post-login redirect goes to the correct URI", () => {
  it("should redirect to the correct URI for a simple object page", () => {
    // Navigate to a gene page.
    cy.visit("/");
    cy.get("[data-testid=genes]").click();
    cy.get(`[data-testid^="search-list-item"]`).should(
      "have.length.at.least",
      1
    );
    cy.get(`[aria-label^="View details for"]`).first().click();

    // Test that the gene page has the correct elements.
    cy.url().should("include", "/genes/ENSG00000");
    cy.get("h1").should("have.length", 1);
    cy.get("div").should("have.class", "border-panel bg-panel");

    // Sign in.
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(
      Cypress.env("AUTH_USERNAME"),
      Cypress.env("AUTH_PASSWORD"),
      true
    );
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Confirm that we redirect back to the gene page.
    cy.url().should("include", "/genes/ENSG00000");
  });

  it("should redirect to the correct URI for the search page", () => {
    // Navigate to the Page list page and confirm it has the correct elements.
    cy.visit("/");
    cy.get("[data-testid=pages]").click();
    cy.url().should("include", "/search?type=Page");
    cy.get("h1").should("have.length", 1);
    cy.get("h1").contains("Page");
    cy.get(`[data-testid^="search-list-item"]`).should(
      "have.length.at.least",
      1
    );

    // Sign in.
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(
      Cypress.env("AUTH_USERNAME"),
      Cypress.env("AUTH_PASSWORD"),
      true
    );
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Confirm that we redirect back to the Page list page.
    cy.url().should("include", "/search?type=Page");
  });

  it("should redirect to the correct path for the report page", () => {
    // Navigate to the Page report page and confirm it has the correct elements.
    cy.visit("/");
    cy.get("[data-testid=users]").click();
    cy.get(`[label="Select report view"]`).click();
    cy.url().should("include", "/report?type=User");
    cy.get("h1").should("have.length", 1);
    cy.get("h1").contains("User");
    cy.get(`[role="table"]`);

    // Sign in.
    cy.log(`CYPRESSENV: ${Cypress.env("AUTH_USERNAME")}`);
    cy.loginAuth0(
      Cypress.env("AUTH_USERNAME"),
      Cypress.env("AUTH_PASSWORD"),
      true
    );
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Confirm that we redirect back to the User report page.
    cy.url().should("include", "/report?type=User");
  });
});
