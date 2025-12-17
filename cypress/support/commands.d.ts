/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Login with auth0
     * @param username The username to use for the login
     * @param password The password to use for the login
     * @param isHomeFirst True to visit the home page before logging in
     */
    loginAuth0(
      username: string,
      password: string,
      isHomeFirst?: boolean
    ): Chainable<void>;

    /**
     * Logout of the site using the UI
     */
    logoutAuth0(): Chainable<void>;

    /**
     * Insert delays after requests to allow the server to process the request
     * @param reload Whether to reload after waiting
     * @param delay Time to delay in ms
     */
    delayForIndexing(reload?: boolean, delay?: number): Chainable<void>;

    /**
     * Reload with a delay to allow the page to load
     * @param delay Time to delay in ms
     * @param waitForLogin Whether to wait for login to complete before continuing
     */
    reloadWithDelay(delay?: number, waitForLogin?: boolean): Chainable<void>;
  }
}
