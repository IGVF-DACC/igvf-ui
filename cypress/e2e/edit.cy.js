/// <reference types="cypress" />

describe("Test Edit button", () => {
  // 1. Editing an object shows the correct Title
  it("Edit Page shows correct title for object", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the users users
    cy.get("[data-testid=users]").click();
    // Get the first user by:
    // <ul> element with data-testid == "search-list", get the first <li>
    // and a contained <a>, and click it
    cy.get("ul[data-testid=search-list] li:first a").click();
    cy.get("a[label=Edit]").click();

    cy.url().should("include", "#!edit");

    cy.wait(1000);

    cy.get("nav div:last").then(($el) => {
      const name = $el.text();
      cy.log(name);
      cy.get("h1").then(($h) => {
        expect($h.text()).to.equal(`${name}`);
      });
    });
  });
  // 2. Typing garbage shows errors
  it("Errors appear when typing invalid json", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the users users
    cy.get("[data-testid=users]").click();
    // Get the first user by:
    // <ul> element with data-testid == "search-list", get the first <li>
    // and a contained <a>, and click it
    cy.get("ul[data-testid=search-list] li:first a").click();
    cy.get("a[label=Edit]").click();

    cy.url().should("include", "#!edit");

    cy.wait(1000);

    cy.get('[id="JSON Editor"]').should("exist");
    cy.contains("first_name").should("exist");
    cy.get("textarea").focus().type("Garbo");

    // Find the error, Save should be disabled
    cy.get(".ace_error").should("exist");
    cy.get("button").contains("Save").should("be.disabled");
  });
  // 3. Edit the json and save will update the content
  it("Edit and save will update the content", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the users users
    cy.get("[data-testid=users]").click();
    // Get the first user by:
    // <ul> element with data-testid == "search-list", get the first <li>
    // and a contained <a>, and click it
    cy.get("ul[data-testid=search-list] li:first a").click();
    cy.wait(2000);
    cy.get("a[label=Edit]").click();

    cy.url().should("include", "#!edit");

    cy.wait(1000);

    cy.get('[id="JSON Editor"]').should("exist");

    const now = new Date().getTime();
    cy.get("textarea")
      .focus()
      .clear()
      .type("{\n")
      .type('"creation_timestamp": "2023-03-01T00:31:51.129742+00:00",\n')
      .type('"email": "christina@email_domain.com",\n')
      .type(`"first_name": "${now}",\n`)
      .type('"groups": [\n')
      .type('"verified"\n')
      .type("{backspace}{rightArrow},\n")
      .type('"job_title": "Principal Investigator",\n')
      .type('"lab": "/labs/christina-leslie/",\n')
      .type('"last_name": "Leslie",\n')
      .type('"schema_version": "2",\n')
      .type('"status": "current",\n')
      .type('"submits_for": [\n')
      .type('"/labs/christina-leslie/"\n')
      .type("{backspace}{rightArrow},\n")
      .type('"viewing_groups": [\n')
      .type('"IGVF"\n')
      .type("{backspace}{rightArrow}\n")
      .type("{backspace}{backspace}");
    cy.contains(`${now}`).should("exist");

    cy.get("button").contains("Save").click();
    cy.wait(1000);
    cy.reload();
    cy.get("h1").then(($el) => {
      expect($el.text()).to.contain(`${now}`);
    });
  });
  // 4. Type garbage and save should show an error
  it("Saving a bad form should show an error", () => {
    cy.loginAuth0(Cypress.env("AUTH_USERNAME"), Cypress.env("AUTH_PASSWORD"));
    cy.contains("Cypress Testing");
    cy.wait(1000);

    // Go to the users users
    cy.get("[data-testid=users]").click();
    // Get the first user by:
    // <ul> element with data-testid == "search-list", get the first <li>
    // and a contained <a>, and click it
    cy.get("ul[data-testid=search-list] li:first a").click();
    cy.get("a[label=Edit]").click();

    cy.url().should("include", "#!edit");

    cy.wait(1000);

    cy.get('[id="JSON Editor"]').should("exist");

    const badEmail = "NotAnEmail";
    cy.get("textarea")
      .focus()
      .clear()
      .type("{\n")
      .type('"creation_timestamp": "2023-03-01T00:31:51.129742+00:00",\n')
      .type(`"email": "${badEmail}",\n`)
      .type('"first_name": "Christina",\n')
      .type('"groups": [\n')
      .type('"verified"\n')
      .type("{backspace}{rightArrow},\n")
      .type('"job_title": "Principal Investigator",\n')
      .type('"lab": "/labs/christina-leslie/",\n')
      .type('"last_name": "Leslie",\n')
      .type('"schema_version": "2",\n')
      .type('"status": "current",\n')
      .type('"submits_for": [\n')
      .type('"/labs/christina-leslie/"\n')
      .type("{backspace}{rightArrow},\n")
      .type('"viewing_groups": [\n')
      .type('"IGVF"\n')
      .type("{backspace}{rightArrow}\n")
      .type("{backspace}{backspace}");
    cy.get("button").contains("Save").click();
    cy.contains(`'${badEmail}' is not a 'email'`);
    // Test Cancel Button
    cy.get("a").contains("Cancel").click();
    cy.url().should("not.include", "#!edit");
  });
});
