/// <reference types="cypress" />

describe("Test report column selector", () => {
  it("handles the column selector correctly for a mundane report type", () => {
    // Open the modal for InVitroSystem reports.
    cy.visit("/multireport/?type=InVitroSystem");
    cy.contains("Columns").click();

    // Make sure the column count string displays, and doesn't contain a maximum count.
    cy.get(`[data-testid="visible-column-count"]`).should("exist");
    cy.get(`[data-testid="visible-column-count"]`).contains(
      /^\d+ columns shown$/
    );

    // Make sure at least 10 checkboxes are selected by default.
    cy.get(`fieldset[data-testid="column-checkboxes"]`).within(() => {
      cy.get('input[type="checkbox"]')
        .filter(":checked")
        .should("have.length.at.least", 10);
    });
  });

  it("handles the column selector correctly for a report type with more than the maximum number of columns", () => {
    cy.visit("/multireport/?type=Item");
    cy.contains("Columns").click();

    // Make sure the column count string displays, and contains a maximum count.
    cy.get(`[data-testid="visible-column-count"]`).should("exist");
    cy.get(`[data-testid="visible-column-count"]`).contains(
      /^\d+ columns shown of 120 maximum$/
    );

    // Make sure at least 10 checkboxes are selected by default.
    cy.get(`fieldset[data-testid="column-checkboxes"]`).within(() => {
      cy.get('input[type="checkbox"]')
        .filter(":checked")
        .should("have.length.at.least", 10);
    });

    // Click the Show All button and make sure only 120 checkboxes get selected.
    cy.contains("Show All").click();
    cy.get(`[data-testid="visible-column-count"]`).contains(
      /^120 columns shown of 120 maximum$/
    );

    // Make sure exactly 120 checkboxes are selected by default.
    cy.get(`fieldset[data-testid="column-checkboxes"]`).within(() => {
      cy.get('input[type="checkbox"]')
        .filter(":checked")
        .should("have.length", 120);
    });
  });
});
