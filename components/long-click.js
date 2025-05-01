// node_modules
import { useEffect, useRef } from "react";

/**
 * Default amount of time in milliseconds to wait before considering a mouse click a long press.
 */
const DEFAULT_DELAY = 250;

/**
 * Hook to detect short and long clicks in an element. Pass it the ID of the element to attach the
 * event listeners to. Pass it the regular- and long-click callbacks. It calls the regular-click
 * callback when the user short-clicks the element, and the long-click callback when the user
 * long-clicks the element.
 *
 * It returns an object with a function to call to trigger the mouse-up action, if some other way
 * of triggering the mouse-up action is needed. As an example, a checkbox needs to handle clicks
 * itself for accessibility, so its `onClick` handler calls the `onClickEnd` function returned by
 * this hook.
 *
 * This hook also returns the ID of the long-click timer, in case it needs clearing due to some
 * event that happens outside this hook.
 * @param {string} elementId Unique ID of the element to attach the event listeners to
 * @param {function} onClick Called when the user short-clicks the element
 * @param {function} onLongClick Called when the user long-clicks the element
 * @param {number} delay? Time in milliseconds to wait before considering a mouse click a long press
 * @returns {object} Contains the `onClickEnd` callback and the `timer` object
 */
export default function useLongClick(
  elementId,
  onClick,
  onLongClick,
  delay = DEFAULT_DELAY
) {
  // The "UNSET" timer value indicates that the timer isn't active. That's as opposed to the null
  // value, which indicates that the timer has expired
  const timer = useRef(null);

  /**
   * Called when the user presses the mouse button or touches the touchscreen. Start the long-click
   * timer to determine whether the user long-pressed the checkbox. If the timer expires before
   * mouse up, notify the client component.
   */
  function onMouseDown() {
    timer.current = setTimeout(() => {
      timer.current = null;
      onLongClick();
    }, delay);
  }

  /**
   * Called when the user releases the mouse or lifts their finger off the touchscreen. If the user
   * released the mouse button before the click timer expired, call the `onClick` callback.
   * Otherwise, the user long-pressed the checkbox, so call the `onLongClick` callback if it exists.
   */
  function onMouseUp() {
    if (timer.current) {
      clearTimeout(timer.current);
      onClick();
    }
    timer.current = null;
  }

  useEffect(() => {
    if (onLongClick) {
      // Install the event listeners for the checkbox. We don't need the "mouseup" event because
      // "click" fires after "mouseup," getting handled by the checkbox `onClick` handler.
      const el = document.getElementById(elementId);
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("mouseup", onMouseUp);
      el.addEventListener("touchstart", onMouseDown);
      el.addEventListener("touchend", onMouseUp);

      return () => {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mouseup", onMouseUp);
        el.removeEventListener("touchstart", onMouseDown);
        el.removeEventListener("touchend", onMouseUp);
      };
    }
  });

  return timer.current;
}
