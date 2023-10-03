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
  const timer = useRef("UNSET");

  /**
   * Called when the user presses the mouse button or touches the touchscreen. Start the long-click
   * timer to determine whether the user long-pressed the checkbox.
   */
  function onMouseDown() {
    timer.current = setTimeout(() => {
      timer.current = null;
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
    } else {
      // The mouse-up event happened after the click timer expired, so the user long-pressed the
      // checkbox. Call the onLongChange callback if it exists.
      onLongClick();
    }
    timer.current = "UNSET";
  }

  /**
   * Handle click events, usually by ignoring them because we already handle mouseup events above.
   * But the user can trigger click events with the keyboard, and we have to handle those because
   * no mouse events happen. For that case, we call our mouseup handler. We can tell the user used
   * the keyboard to trigger the click because the `detail` property of the event is 0.
   * @param {object} event Synthetic click event for the checkbox
   */
  function cancelClick(event) {
    event.preventDefault();
    if (event.detail === 0) {
      onMouseUp();
    }
  }

  useEffect(() => {
    // Install the event listeners for the checkbox. We don't need the "mouseup" event because
    // "click" fires after "mouseup," getting handled by the checkbox `onClick` handler.
    const el = document.getElementById(elementId);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("touchstart", onMouseDown);
    el.addEventListener("touchend", onMouseUp);
    el.addEventListener("click", cancelClick);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("touchstart", onMouseDown);
      el.removeEventListener("touchend", onMouseUp);
      el.removeEventListener("click", cancelClick);
    };
  });

  return timer.current;
}
