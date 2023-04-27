// node_modules
import { useRef } from "react";

/**
 * Returns a function that starts or restarts a timer when called, and it calls your callback if
 * the timer expires before you restart it. Example usage:
 *
 * const restartDebounceTimer = useDebounceTimer(500);
 * function handleClick() {
 *   restartDebounceTimer(() => console.log("Hello world!"));
 * }
 * return (
 *   <button onClick={handleClick}>
 *     Click to restart timer before 500ms console.log output
 *   </button>
 * );
 *
 * @param {number} delay Delay in milliseconds before your callback gets called
 * @returns {function} Function that resets the timer
 */
export default function useDebounceTimer(delay) {
  const debounceTimerId = useRef(0);

  function restartDebounceTimer(callback) {
    clearTimeout(debounceTimerId.current);
    debounceTimerId.current = setTimeout(callback, delay);
  }

  return restartDebounceTimer;
}
