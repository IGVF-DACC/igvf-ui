/// <reference types="cypress" />

describe("Facet tests", () => {
  it("shows the correct facet components for an object type", () => {
    // Login so we can test persistent open facets.
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Navigate to the InVitroSystem list view.
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();

    // Click the link with aria-label containing "In Vitro Systems"
    cy.get(`[aria-label="List view of all In Vitro Systems objects"]`).click();

    // Make sure we have some search results.
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length.gte", 5);

    // Make sure we have some facets and open the Sample one. For some reason we need the delay or
    // it ignores the click.
    cy.get(`[data-testid^="facet-container-"]`).should("have.length.gte", 3);
    cy.wait(1000);
    cy.get(`[data-testid="facettrigger-sample_terms.term_name"]`).click();

    // Make sure clicking a facet term in the Sample facet has an effect.
    cy.get(`label[id="facet-checkbox-sample_terms.term_name-hues8"]`).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length.gte", 2);
    cy.get(`[aria-label="Clear Sample filter for HUES8"]`).should("exist");
    cy.get(`label[id="facet-checkbox-sample_terms.term_name-hues8"]`).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length.gte", 5);
    cy.get(`[aria-label="Clear Sample Terms filter for HUES8"]`).should(
      "not.exist"
    );

    // Open the Lab facet, click a term, and make sure it has an effect.
    cy.wait(1000);
    cy.get(`[data-testid="facettrigger-lab.title"]`).click();
    cy.get(
      `label[id="facet-checkbox-lab.title-danwei-huangfu-2c-mskcc"]`
    ).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length.gte", 2);
    cy.get(`[aria-label="Clear Lab filter for Danwei Huangfu, MSKCC"]`).should(
      "exist"
    );

    // Click a facet tag to clear that term.
    cy.get(`[aria-label="Clear Lab filter for Danwei Huangfu, MSKCC"]`).click();
    cy.get(`[aria-label="Clear Lab filter for Danwei Huangfu, MSKCC"]`).should(
      "not.exist"
    );
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length.gte", 5);

    // Check we can transition to the report view with selected facets. Delay three seconds to make
    // sure opened facets get saved.
    cy.wait(3000);
    cy.get(
      `label[id="facet-checkbox-lab.title-j-michael-cherry-2c-stanford"]`
    ).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 4);
    cy.get(`[aria-label="Select report view"]`).click();
    cy.get(`[data-testid="search-results-count"]`).should(
      "have.text",
      "4 items"
    );

    // Now we're in the report view. Make sure the Sample and Lab facets are still open.
    cy.get(`[data-testid="facettrigger-sample_terms.term_name"]`).should(
      "have.attr",
      "aria-expanded",
      "true"
    );
    cy.get(`[data-testid="facettrigger-lab.title"]`).should(
      "have.attr",
      "aria-expanded",
      "true"
    );

    // Uncheck the lab facet term and make sure the count updates.
    cy.get(
      `label[id="facet-checkbox-lab.title-j-michael-cherry-2c-stanford"]`
    ).click();
    cy.get(`[data-testid="search-results-count"]`).should(
      "have.text",
      "6 items"
    );

    // Load the search view and make sure the Sample and Lab facets are still open.
    cy.visit("/search/?type=InVitroSystem");
    cy.get(`[data-testid="facettrigger-sample_terms.term_name"]`).should(
      "have.attr",
      "aria-expanded",
      "true"
    );
    cy.get(`[data-testid="facettrigger-lab.title"]`).should(
      "have.attr",
      "aria-expanded",
      "true"
    );
  });
});
