/**
 * Contains utilities to work with touch devices.
 */

// node_modules
import { useState, useEffect } from "react";

/**
 * Returns an object with a media query that matches if the device has a coarse pointer, indicating
 * a touch device.
 * @returns A MediaQueryList object that matches if the device has a coarse pointer.
 */
function coarsePointerQuery(): MediaQueryList {
  return window.matchMedia("(pointer: coarse)");
}

/**
 * Checks if the device has a coarse pointer, indicating a touch device.
 * @returns True if the device has a coarse pointer
 */
function checkCoarsePointer(): boolean {
  return coarsePointerQuery().matches;
}

/**
 * Determines whether the browser's device currently uses a touch or mouse pointer.
 * @returns True if the device uses a touch pointer
 */
export function useTouchPointerType(): boolean {
  // True if the device currently uses a touch pointer
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    /**
     * Sets the current touch-device status based on the device's pointer type.
     */
    function setTouch() {
      setIsTouch(checkCoarsePointer());
    }

    /**
     * Sets the current pointer type when the device's pointer type changes.
     * @param event MediaQueryListEvent that contains the new pointer type
     */
    function coarsePointerListener(event) {
      setIsTouch(event.matches);
    }

    setTouch();

    // Listen for changes in the device's pointer type for those devices that can change between
    // mouse and touch.
    const mediaQuery = coarsePointerQuery();
    mediaQuery.addEventListener("change", coarsePointerListener);
    return () =>
      mediaQuery.removeEventListener("change", coarsePointerListener);
  }, []);

  return isTouch;
}
