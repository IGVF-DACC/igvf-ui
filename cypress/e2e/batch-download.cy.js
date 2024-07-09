/// <reference types="cypress" />

describe("Batch download tests", () => {
  it("shows the batch download button on a FileSet list view", () => {
    cy.visit("/search/?type=FileSet");
    cy.get(`[data-testid="batch-download-actuator"]`).should("exist");

    // Click the batch download button to open the modal.
    cy.get(`[data-testid="batch-download-actuator"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("exist");
    cy.get(`[aria-label="Close dialog"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("not.exist");
  });

  it("shows the batch download button on a FileSet report view", () => {
    cy.visit("/multireport/?type=FileSet");
    cy.get(`[data-testid="batch-download-actuator"]`).should("exist");

    // Click the batch download button to open the modal.
    cy.get(`[data-testid="batch-download-actuator"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("exist");
    cy.get(`[aria-label="Close dialog"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("not.exist");
  });

  it("shows the batch download button on an AnalysisSet list view", () => {
    cy.visit("/search/?type=AnalysisSet");
    cy.get(`[data-testid="batch-download-actuator"]`).should("exist");

    // Click the batch download button to open the modal.
    cy.get(`[data-testid="batch-download-actuator"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("exist");
    cy.get(`[aria-label="Close dialog"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("not.exist");
  });

  it("shows the batch download button on an AnalysisSet report view", () => {
    cy.visit("/multireport/?type=AnalysisSet");
    cy.get(`[data-testid="batch-download-actuator"]`).should("exist");

    // Click the batch download button to open the modal.
    cy.get(`[data-testid="batch-download-actuator"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("exist");
    cy.get(`[aria-label="Close dialog"]`).click();
    cy.get(`[data-testid="batch-download-modal"]`).should("not.exist");
  });

  it("doesn't show the batch download button on a File or Biosample list view", () => {
    cy.visit("/search/?type=File");
    cy.get(`[data-testid="batch-download-actuator"]`).should("not.exist");

    cy.visit("/search/?type=Biosample");
    cy.get(`[data-testid="batch-download-actuator"]`).should("not.exist");
  });

  it("doesn't show the batch download button with both AnalysisSet and MeasurementSet", () => {
    cy.visit("/search/?type=AnalysisSet&type=MeasurementSet");
    cy.get(`[data-testid="batch-download-actuator"]`).should("not.exist");
  });
});
