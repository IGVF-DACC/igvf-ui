// node_modules
import { useState } from "react";

/**
 * These hooks let you use localStorage and sessionStorage in a way similar to React state.
 * Normally, the first call to `useLocalStorage` or `useSessionStorage` returns the initial value
 * passed to the hook. However, if the value with the matching key is stored in localStorage or
 * sessionStorage, the value from localStorage or sessionStorage is returned instead.
 *
 * These hooks can detect when they get called on the server and only return the initial value,
 * even if you set a new value (unlikely to happen on server render anyway).
 */
/**
 * Analogous to useState, but sets new values in the browser's localStorage, and recalls them.
 * Supply a key to identify the value in localStorage.
 * @param {string} key Identifier of the given localStorage data
 * @param {*} initialValue Initial value to set for the key; including objects
 * @returns {array} [
 *   0: Value retrieved from localStorage
 *   1: Function to set new value in localStorage; calling component must be mounted
 * ]
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const item =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return item ? JSON.parse(item) : initialValue;
  });

  const setValueMethod = (valueToStore) => {
    if (typeof window !== "undefined") {
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [value, setValueMethod];
};

/**
 * Analogous to useState, but sets new values in the browser's sessionStorage, and recalls them.
 * Supply a key to identify the value in sessionStorage.
 * @param {string} key Identifier of the given sessionStorage data
 * @param {*} initialValue Initial value to set for the key; including objects
 * @returns {array} [
 *   0: Value retrieved from sessionStorage
 *   1: Function to set new value in sessionStorage; calling component must be mounted
 * ]
 */
export const useSessionStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const item =
      typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
    return item ? JSON.parse(item) : initialValue;
  });

  const setValueMethod = (valueToStore) => {
    if (typeof window !== "undefined") {
      setValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [value, setValueMethod];
};
