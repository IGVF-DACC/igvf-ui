/// <reference types="cypress" />

import "../support/commands";

// Keep this array in sync with the optionalFacetTypes defined in lib/facets.ts. Do not import this
// from that file because of module resolution issues in Cypress.
const optionalFacetTypes = [
  "AnalysisSet",
  "File",
  "MeasurementSet",
  "PredictionSet",
];

describe("Optional Facets Functionality", () => {
  function visitListPageWithType(type: string) {
    cy.visit(`/search/?type=${type}`);
  }

  function visitReportPageWithType(type: string) {
    cy.visit(`/multireport/?type=${type}`);
  }

  function conductOptionalFacetsTests(isAuthenticated = false) {
    // Click the optional facets button to open the modal.
    cy.get(`[data-testid="optional-facets-button"]`).click();
    cy.get("body").trigger("mousemove", { clientX: 500, clientY: 400 });
    cy.get(`[id^="headlessui-dialog-panel"]`).should("be.visible");

    // Click the Award checkbox, then save and make sure that facet appears.
    cy.get(`input[type="checkbox"][aria-label="Award"]`)
      .should("exist")
      .and("not.be.checked");
    cy.get(`input[type="checkbox"][aria-label="Award"]`).check();
    cy.get('button[id="save-optional-facets-modal-button"]').click();

    // Wait for modal to close and verify facet appears.
    cy.get(`[id^="headlessui-dialog-panel"]`).should("not.exist");
    cy.get(`[data-testid="facet-container-award.component"]`, {
      timeout: 10000,
    }).should("be.visible");

    // Reload the page and make sure the Award facet is still there.
    cy.reloadWithDelay(0, isAuthenticated);
    cy.get(`[data-testid="facet-container-award.component"]`).should(
      "be.visible"
    );

    // Reopen the modal and uncheck the Award checkbox, then save and make sure that facet
    // disappears.
    cy.get(`[data-testid="optional-facets-button"]`).click();
    cy.get("body").trigger("mousemove", { clientX: 500, clientY: 400 });

    // Check that the Award checkbox is checked, then uncheck it.
    cy.get(`input[type="checkbox"][aria-label="Award"]`)
      .should("exist")
      .and("be.checked");
    cy.get(`input[type="checkbox"][aria-label="Award"]`).uncheck();
    cy.get('button[id="save-optional-facets-modal-button"]').click();

    // Wait for modal to close and verify facet is gone.
    cy.get(`[id^="headlessui-dialog-panel"]`).should("not.exist");
    cy.get(`[data-testid="facet-container-award.component"]`).should(
      "not.exist"
    );

    // Reload the page and make sure the Award facet is still gone.
    cy.reloadWithDelay(0, isAuthenticated);
    cy.get(`[data-testid="facet-container-award.component"]`).should(
      "not.exist"
    );

    // Reopen the modal and check the Award checkbox again, then click the Clear button
    // and make sure no checkboxes are checked.
    cy.get(`[data-testid="optional-facets-button"]`).click();
    cy.get("body").trigger("mousemove", { clientX: 500, clientY: 400 });

    // Check that the Award checkbox is unchecked, then check it, then click the Clear button.
    cy.get(`input[type="checkbox"][aria-label="Award"]`)
      .should("exist")
      .and("not.be.checked");
    cy.get(`input[type="checkbox"][aria-label="Award"]`).check();
    cy.get('button[id="clear-optional-facets-modal-button"]').click();
    cy.get(`input[type="checkbox"][aria-label="Award"]`).should(
      "not.be.checked"
    );

    // Click the Award checkbox again, then save and make sure that facet appears.
    cy.get(`input[type="checkbox"][aria-label="Award"]`).check();
    cy.get('button[id="save-optional-facets-modal-button"]').click();

    // Wait for modal to close and verify facet appears.
    cy.get(`[id^="headlessui-dialog-panel"]`).should("not.exist");
    cy.get(`[data-testid="facet-container-award.component"]`, {
      timeout: 10000,
    }).should("be.visible");

    // Make sure a button to quick hide the Award facet appears, then click it and make sure
    // the facet no longer appears.
    cy.get(
      `[data-testid="optional-facet-quick-hide-button-award.component"]`
    ).click();
    cy.get(`[data-testid="facet-container-award.component"]`).should(
      "not.exist"
    );
    cy.reloadWithDelay(0, isAuthenticated);
    cy.get(`[data-testid="facet-container-award.component"]`).should(
      "not.exist"
    );
  }

  describe("Conduct list and report view optional facet tests while logged out", () => {
    optionalFacetTypes.forEach((type) => {
      it(`should display the optional facets button for type: ${type} while logged out`, () => {
        // Visit the list page for the current `@type`.
        visitListPageWithType(type);
        conductOptionalFacetsTests();
        visitReportPageWithType(type);
        conductOptionalFacetsTests();
      });
    });
  });

  describe("Conduct list and report view optional facet tests while logged in", () => {
    beforeEach(() => {
      cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
      cy.contains("Cypress Testing");
      cy.wait(1000);
    });

    optionalFacetTypes.forEach((type) => {
      it(`should display the optional facets button for type: ${type} while logged in`, () => {
        // Visit the list page for the current `@type`.
        visitListPageWithType(type);
        conductOptionalFacetsTests(true);
        visitReportPageWithType(type);
        conductOptionalFacetsTests(true);
      });
    });
  });
});
