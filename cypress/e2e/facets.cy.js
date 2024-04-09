/// <reference types="cypress" />

describe("Facet tests", () => {
  it("shows the correct facet components for an object type", () => {
    cy.visit("/search?type=InVitroSystem");

    // Make sure facet groups are present and the first is selected.
    cy.get(`[data-testid="facetgroup-buttons"]`).should("exist");
    cy.get(`[data-testid="facetgroup-buttons"]`)
      .find("button")
      .should("have.length", 3);
    cy.get(`[data-testid="facetgroup-buttons"]`)
      .find("button")
      .first()
      .should("have.class", "border-facet-group-button-selected");

    // Make sure we have some facets appearing.
    cy.get(`[data-testid^="facet-"]`).should("have.length.gte", 5);
    cy.get(`[data-testid="facet-sample_terms.term_name"]`).should("exist");

    // Make sure we have some search results.
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 5);

    // Make sure clicking a facet term has an effect.
    cy.get(`label[id="facet-checkbox-sample_terms.term_name-hues8"]`).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 1);
    cy.get(`[aria-label="Clear Sample Terms filter for HUES8"]`).should(
      "exist"
    );
    cy.get(`label[id="facet-checkbox-sample_terms.term_name-hues8"]`).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 5);
    cy.get(`[aria-label="Clear Sample Terms filter for HUES8"]`).should(
      "not.exist"
    );

    // Click another facet group and make sure a new set of facets appears.
    cy.get(`[aria-label="Provenance filter group"]`).click();
    cy.get(`[data-testid^="facet-"]`).should("have.length.gte", 4);
    cy.get(`[data-testid="facet-sample_terms.term_name"]`).should("not.exist");
    cy.get(`[data-testid="facet-collections"]`).should("exist");

    // Make sure we have some search results.
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 5);

    // Click a facet term and make sure it has an effect.
    cy.get(
      `label[id="facet-checkbox-sources.title-danwei-huangfu-mskcc"]`
    ).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 1);
    cy.get(
      `[aria-label="Clear Source filter for Danwei Huangfu, MSKCC"]`
    ).should("exist");

    // Click a facet tag to clear that term.
    cy.get(
      `[aria-label="Clear Source filter for Danwei Huangfu, MSKCC"]`
    ).click();
    cy.get(
      `[aria-label="Clear Source filter for Danwei Huangfu, MSKCC"]`
    ).should("not.exist");
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 5);

    // Check we can transition to the report view with the facets.
    cy.get(
      `label[id="facet-checkbox-lab.title-j-michael-cherry-stanford"]`
    ).click();
    cy.get(`[data-testid^="search-list-item-/"]`).should("have.length", 4);

    cy.get(`[aria-label="Select report view"]`).click();
    cy.get(`[data-testid="search-results-count"]`).should(
      "have.text",
      "4 items"
    );
    cy.get(`[aria-label="Provenance filter group"]`).click();
    cy.get(
      `label[id="facet-checkbox-lab.title-j-michael-cherry-stanford"]`
    ).click();
    cy.get(`[data-testid="search-results-count"]`).should(
      "have.text",
      "4 items"
    );
  });
});
