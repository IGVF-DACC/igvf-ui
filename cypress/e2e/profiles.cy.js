describe("Test the profiles page and each individual profile page", () => {
  it("should load every schema's list and report page", () => {
    cy.visit("/");

    // Go to the schemas page.
    cy.get(`[data-testid="navigation-data-model"]`).click();
    cy.get(`[data-testid="navigation-schemas"]`).click();

    // Collect up all the list view links for every schema.
    const profileHrefs = [];
    cy.get(`[aria-label^="View schema for"]`).each(($schema) => {
      const href = $schema.attr("href");
      profileHrefs.push(href);
    });
    cy.log(profileHrefs);

    // Visit each list page to make sure it comes up, then go back to the schema page.
    cy.then(() => {
      profileHrefs.forEach((href) => {
        cy.get(`a[href="${href}"]`).click();
        cy.wait(200);

        // The page comes up at all.
        cy.get("h1").should("exist");
        cy.get(`[data-testid="dataitemlabel"]`).should("exist");

        // The Properties and Dependencies tabs exist.
        cy.get(`[role="tab"]`).contains("Properties").should("exist");
        cy.get(`[role="tab"]`).contains("Dependencies").should("exist");

        // At least one schema property exists.
        cy.get(`[data-testid^="schema-property-"]`).should("exist");

        // No elements with the not-submittable icon exist.
        cy.get(`[data-testid^="property-not-submittable-"]`).should(
          "not.exist"
        );

        // Check the "Include non-submittable properties" checkbox.
        cy.get(`[id="only-submittable"]`).click();

        // At least one element with the not-submittable icon exists.
        cy.get(`[data-testid^="property-not-submittable-"]`).should("exist");

        // Uncheck the "Include non-submittable properties" checkbox.
        cy.get(`[id="only-submittable"]`).click();

        // No elements with the not-submittable icon exist.
        cy.get(`[data-testid^="property-not-submittable-"]`).should(
          "not.exist"
        );

        // No schema property JSON panels exist.
        cy.get(`[id^="schema-json-"]`).should("not.exist");

        // Click the first button with an html id starting with "property" and ending with "control"
        cy.get(`[id^="property"][id$="control"]`).first().click();

        // One schema property JSON panel exists.
        cy.get(`[id^="schema-json-"]`).should("exist");

        // Click the JSON tab. A single <pre> element exists.
        cy.get(`[role="tab"]`).contains("JSON").click();
        cy.get(`[role="tabpanel"]`).find("pre").should("have.length", 1);

        // Click the "Changelog" tab. A markdown block exists.
        cy.get(`[role="tab"]`).contains("Changelog").click();
        cy.get(`[role="tabpanel"]`).find(".prose").should("exist");

        // Go back to the profiles page.
        cy.get(`[data-testid="navigation-schemas"]`).click();
      });
    });
  });
});
