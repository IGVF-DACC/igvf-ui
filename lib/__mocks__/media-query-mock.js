/**
 * This module allows you to mock the matchMedia event API. Use it to test your code that adds event
 * listeners for media queries.
 *
 * Adapted from:
 * https://github.com/dyakovk/jest-matchmedia-mock
 */
import { jest } from "@jest/globals";

export default class MatchMediaMock {
  #mediaQueries = {};
  #mediaQueryList;
  #currentMediaQuery;

  constructor(initialQuery = "(prefers-color-scheme: light)") {
    this.#currentMediaQuery = initialQuery;

    // Add the window.matchMedia() mock.
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation((query) => {
        return {
          matches: query === this.#currentMediaQuery,
          media: query,
          onchange: null,
          addEventListener: (type, listener) => {
            if (type === "change") {
              this.#addListener(query, listener);
            }
          },
          removeEventListener: (type, listener) => {
            if (type === "change") {
              this.#removeListener(query, listener);
            }
          },
          dispatchEvent: jest.fn(),
        };
      }),
    });
  }

  /**
   * Adds a new event-listener function for the specified media query.
   */
  #addListener(mediaQuery, listener) {
    if (!this.#mediaQueries[mediaQuery]) {
      this.#mediaQueries[mediaQuery] = [];
    }

    const query = this.#mediaQueries[mediaQuery];
    const listenerIndex = query.indexOf(listener);

    if (listenerIndex === -1) {
      query.push(listener);
    }
  }

  /**
   * Removes a previously added event-listener function for the specified media query.
   */
  #removeListener(mediaQuery, listener) {
    if (this.#mediaQueries[mediaQuery]) {
      const query = this.#mediaQueries[mediaQuery];
      const listenerIndex = query.indexOf(listener);
      if (listenerIndex !== -1) {
        query.splice(listenerIndex, 1);
      }
    }
  }

  /**
   * Updates the currently used media query and calls previously added listener functions
   * registered for this media query.
   */
  useMediaQuery(mediaQuery, isMatch) {
    if (typeof mediaQuery !== "string") {
      throw new Error("Media Query must be a string");
    }

    this.#currentMediaQuery = mediaQuery;

    if (this.#mediaQueries[mediaQuery]) {
      const mqListEvent = {
        matches: isMatch,
        media: mediaQuery,
      };

      this.#mediaQueries[mediaQuery].forEach((listener) => {
        listener.call(this.#mediaQueryList, mqListEvent);
      });
    }
  }

  /**
   * Returns an array listing the media queries for which the matchMedia has registered listeners.
   */
  getMediaQueries() {
    return Object.keys(this.#mediaQueries);
  }

  /**
   * Returns a copy of the array of listeners for the specified media query.
   */
  getListeners(mediaQuery) {
    if (this.#mediaQueries[mediaQuery]) {
      return this.#mediaQueries[mediaQuery].slice();
    }
    return [];
  }

  /**
   * Clears all registered media queries and their listeners.
   */
  clear() {
    this.#mediaQueries = {};
  }

  /**
   * Clears all registered media queries and their listeners, and destroys the implementation of
   * `window.matchMedia`.
   */
  destroy() {
    this.clear();
    delete window.matchMedia;
  }
}
