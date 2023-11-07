/// <reference types="cypress" />

describe("page-component tests", () => {
  it("displays the IMAGE_ALIGNED component", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Add a new page.
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[aria-label="Add Page"]`).click();

    // Add an image aligned component.
    cy.get("#block1-type").select("Component");
    cy.get("#block1").type(
      "IMAGE_ALIGNED{enter}src=/pages/igvf-winter-logo.png{enter}alt=IGVF Logo{enter}width=33%"
    );

    // Fill in the metadata and save the page.
    const now = new Date().getTime();
    cy.get("#name").type(`image-aligned-page-${now}`);
    cy.get("#title").type(`Image Aligned Page ${now}`);
    cy.get(`[aria-label="Save edits to page"]`).click();

    // Make sure the image is displayed.
    cy.contains("Image Aligned Page");
    cy.get("img").should("have.attr", "src", "/pages/igvf-winter-logo.png");
    cy.get("img").should("have.attr", "alt", "IGVF Logo");
    cy.get("picture").should("have.attr", "style", "width: 33%;");
  });

  it("displays the PAGE_NAV component", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Add a new page.
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[aria-label="Add Page"]`).click();

    // Add an image aligned component.
    cy.get("#block1-type").select("Component");
    cy.get("#block1").type(
      "PAGE_NAV{enter}Item 1=#item1{enter}Item 2=#item2{enter}Item 3=#item3"
    );

    // Fill in the metadata and save the page.
    const now = new Date().getTime();
    cy.get("#name").type(`page-navigation-page-${now}`);
    cy.get("#title").type(`Page Navigation Page ${now}`);
    cy.get(`[aria-label="Save edits to page"]`).click();

    // Make sure the navigation bar displays.
    cy.contains(`Page Navigation Page ${now}`);
    cy.get("[data-testid='page-blocks'] nav a")
      .eq(0)
      .should("have.attr", "href", "#item1")
      .and("have.text", "Item 1");
    cy.get("[data-testid='page-blocks'] nav a")
      .eq(1)
      .should("have.attr", "href", "#item2")
      .and("have.text", "Item 2");
    cy.get("[data-testid='page-blocks'] nav a")
      .eq(2)
      .should("have.attr", "href", "#item3")
      .and("have.text", "Item 3");
  });

  it("displays the VIDEO_YOUTUBE component", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Add a new page.
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[aria-label="Add Page"]`).click();

    // Add an image aligned component.
    cy.get("#block1-type").select("Component");
    cy.get("#block1").type(
      "VIDEO_YOUTUBE{enter}id=Q8TXgCzxEnw{enter}start=200"
    );

    // Fill in the metadata and save the page.
    const now = new Date().getTime();
    cy.get("#name").type(`youtube-video-page-${now}`);
    cy.get("#title").type(`YouTube Video Page ${now}`);
    cy.get(`[aria-label="Save edits to page"]`).click();

    // Make sure the YouTube video displays as an embedded iframe.
    cy.contains("YouTube Video Page");
    cy.get("iframe").should(
      "have.attr",
      "src",
      "https://www.youtube.com/embed/Q8TXgCzxEnw?start=200"
    );
  });

  it("displays the CHEVRON_NAV component", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Add a new page.
    cy.visit("/");
    cy.get("[data-testid=navigation-data-model]").click();
    cy.get("[data-testid=navigation-schemas]").click();
    cy.get(`[aria-label="Add Page"]`).click();

    // Add an image aligned component.
    cy.get("#block1-type").select("Component");
    cy.get("#block1").type("CHEVRON_NAV{enter}");
    cy.get("#block1").type("First Topic=#first-topic|404080{enter}");
    cy.get("#block1").type(
      "Second Topic=https://www.genome.gov/|72c6c2{enter}"
    );
    cy.get("#block1").type("Third Topic=/tissues/IGVFSM0000DDDD|c0c0c0");

    // Fill in the metadata and save the page.
    const now = new Date().getTime();
    cy.get("#name").type(`chevron-nav-page-${now}`);
    cy.get("#title").type(`Chevron Navigation Page ${now}`);
    cy.get(`[aria-label="Save edits to page"]`).click();

    // Make sure the chevron navigation component appears and has the correct links.
    cy.contains(`Chevron Navigation Page ${now}`);
    cy.get(`[data-testid="chevron-navigation"] ul li a`)
      .eq(0)
      .should("have.attr", "href", "#first-topic")
      .should(
        "have.attr",
        "style",
        "color: rgb(255, 255, 255); background-color: rgb(64, 64, 128);"
      )
      .and("have.text", "First Topic");
    cy.get(`[data-testid="chevron-navigation"] ul li a`)
      .eq(1)
      .should("have.attr", "href", "https://www.genome.gov/")
      .should(
        "have.attr",
        "style",
        "color: rgb(255, 255, 255); background-color: rgb(114, 198, 194);"
      )
      .and("have.text", "Second Topic");
    cy.get(`[data-testid="chevron-navigation"] ul li a`)
      .eq(2)
      .should("have.attr", "href", "/tissues/IGVFSM0000DDDD")
      .should(
        "have.attr",
        "style",
        "color: rgb(0, 0, 0); background-color: rgb(192, 192, 192);"
      )
      .and("have.text", "Third Topic");
  });
});
