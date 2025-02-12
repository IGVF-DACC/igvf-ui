describe("Test that the post-login redirect goes to the correct URI", () => {
  it("should redirect to the URI the user viewed before logging in", () => {
    // Navigate to a gene page.
    cy.visit("/");
    cy.get("[data-testid=navigation-data]").click();
    cy.get("[data-testid=navigation-raw-datasets]").click();
    cy.url().should("include", "/search/?type=MeasurementSet");
    cy.wait(1000);

    // Sign in.
    cy.loginAuth0(
      Cypress.env("AUTH_USERNAME"),
      Cypress.env("AUTH_PASSWORD"),
      false
    );

    cy.contains("Cypress Testing");

    cy.window().then((win) => {
      if (win.location.search.includes("code=")) {
        win.history.replaceState({}, document.title, win.location.pathname);
      }
    });

    // Confirm that we redirect back to the gene page.
    cy.url().should("include", "/search/?type=MeasurementSet");
  });
});
