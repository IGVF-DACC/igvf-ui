// node_modules
import { useState } from "react"

/**
 * Analogous to useState, but sets new values in the browser's session storage, and recalls them.
 * Supply a key to identify the value in session storage.
 * @param {string} key Identifier of the given session storage data
 * @param {*} initialValue Initial value to set for the key; including objects
 * @returns {array} [
 *   0: Value retrieved from session storage
 *   1: Function to set new value in session storage; calling component must be mounted
 * ]
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const item =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : null
    return item ? JSON.parse(item) : initialValue
  })

  const setValueMethod = (valueToStore) => {
    if (typeof window !== "undefined") {
      setValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    }
  }

  return [value, setValueMethod]
}

/**
 * Analogous to useState, but sets new values in the browser's session storage, and recalls them.
 * Supply a key to identify the value in session storage.
 * @param {string} key Identifier of the given session storage data
 * @param {*} initialValue Initial value to set for the key; including objects
 * @returns {array} [
 *   0: Value retrieved from session storage
 *   1: Function to set new value in session storage; calling component must be mounted
 * ]
 */
export const useSessionStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const item =
      typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null
    return item ? JSON.parse(item) : initialValue
  })

  const setValueMethod = (valueToStore) => {
    if (typeof window !== "undefined") {
      setValue(valueToStore)
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
    }
  }

  return [value, setValueMethod]
}
