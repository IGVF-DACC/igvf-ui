/// <reference types="cypress" />

describe("Audit tests", () => {
  it("shows audit status buttons on a search-list page which open audit details when clicked", () => {
    cy.visit("/search?type=InVitroSystem");
    cy.get(`[data-testid="audit-status-button"]`).should("have.length.gte", 2);

    // Click the first status button to open a details panel.
    cy.get(`[data-testid="audit-status-button"]`).first().click();
    cy.get(`[data-testid="audit-detail-panel"]`).should("exist");

    // Click the details narrative button to open a narrative for the audit.
    cy.get(`[aria-label="Closed narratives for Error audits"]`).click();
    cy.get(`[data-testid^="audit-level-detail-narrative"]`).should("exist");

    // Click the status button to close the narrative and details panel.
    cy.get(`[data-testid="audit-status-button"]`).first().click();
    cy.get(`[data-testid="audit-detail-panel"]`).should("not.exist");
    cy.get(`[data-testid^="audit-level-detail-narrative"]`).should("not.exist");
  });

  it("shows an audit status button on an object page that opens audit details when clicked", () => {
    cy.visit("/in-vitro-systems/IGVFSM0002AAAZ");
    cy.get(`[data-testid="audit-status-button"]`).should("exist");

    // Click the status button to open the details panel.
    cy.get(`[data-testid="audit-status-button"]`).click();
    cy.get(`[data-testid="audit-detail-panel"]`).should("exist");

    // Click the details narrative button to open the narrative for the audit.
    cy.get(`[aria-label="Closed narratives for Error audits"]`).click();
    cy.get(`[data-testid^="audit-level-detail-narrative"]`).should("exist");

    // Click the status button to close the narrative and details panel.
    cy.get(`[data-testid="audit-status-button"]`).click();
    cy.get(`[data-testid="audit-detail-panel"]`).should("not.exist");
    cy.get(`[data-testid^="audit-level-detail-narrative"]`).should("not.exist");
  });
});
