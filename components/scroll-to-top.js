// node_modules
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

/**
 * Number of milliseconds before the scroll-to-top button fades out if the user hasn't scrolled.
 */
const SCROLLTOTOP_VANISH_DELAY = 5000;

/**
 * Number of pixels the user must scroll down from the top of the page before the scroll-to-top
 * button appears.
 */
const SCROLLTOTOP_MARGIN = 100;

/**
 * Display the scroll-to-top button at the bottom center of the browser window. Include a
 * transparent path that covers the entire button to receive click events over the precise button
 * shape.
 */
function ControlShape({ onClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 45.6 14.8"
        className="mb-0 ml-auto mr-auto mt-0 block w-24"
      >
        <path
          d="M45.6,14.8H0L9,1.7c.6-1.1,1.7-1.7,2.9-1.7h21.7c1.2,0,2.3.7,2.9,1.7l9,13Z"
          className="fill-brand opacity-70"
        />
        <g className="fill-white stroke-none opacity-70">
          <polygon points="26.9 8.1 22.8 3.7 18.7 8.1 19.5 8.8 22.3 5.7 22.3 12.3 23.3 12.3 23.3 5.7 26.2 8.8 26.9 8.1" />
          <rect x="19.2" y="1.9" width="7.2" height="1" />
        </g>
        <path
          d="M45.6,14.8H0L9,1.7c.6-1.1,1.7-1.7,2.9-1.7h21.7c1.2,0,2.3.7,2.9,1.7l9,13Z"
          onClick={onClick}
          role="button"
          aria-label="Scroll to top of page"
          className="cursor-pointer opacity-0 outline-none"
        />
      </svg>
    </div>
  );
}

ControlShape.propTypes = {
  // Function to call when the user clicks the SVG
  onClick: PropTypes.func.isRequired,
};

/**
 * Display and manage a button that scrolls the browser view to the top of the page when the user
 * clicks it. It only appears when the user has scrolled down 100px or greater from the top of the
 * page, and it vanishes if the user doesn't scroll for at least `SCROLLTOTOP_VANISH_DELAY`
 * milliseconds.
 */
export default function ScrollToTop() {
  // True if the scroll-to-top button is visible
  const isScrollToTopVisible = useRef(false);
  // DOM reference to the scroll-to-top button
  const scrollToTopRef = useRef(null);
  // Stores the timeout ID for fading the scroll-to-top button with no user action
  const timeoutId = useRef(null);

  // Scroll the browser view to the top of the page smoothly.
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Reset and restart the user-scroll timeout.
  function resetScrollTimeout() {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      scrollToTopVisibility(false);
    }, SCROLLTOTOP_VANISH_DELAY);
  }

  // Clear the user-scroll timeout without restarting it.
  function clearScrollTimeout() {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }

  // Set the visibility of the scroll-to-top button, with `isVisible` as the new visibility state.
  // This often gets called repeatedly with the same state, so use `isScrollToTopVisible` to avoid
  // showing an already visible button or hiding an already hidden button.
  function scrollToTopVisibility(isVisible) {
    if (isVisible) {
      resetScrollTimeout();
      if (!isScrollToTopVisible.current) {
        scrollToTopRef.current.showPopover();
        isScrollToTopVisible.current = true;
      }
    } else {
      clearScrollTimeout();
      if (isScrollToTopVisible.current) {
        isScrollToTopVisible.current = false;

        // No CSS pseudo-class exists for hiding popovers, preventing fading the button through a
        // CSS animation. Instead, add a class to the popover to let CSS animation fade it out.
        // Once the animation ends, remove the class and hide the popover.
        scrollToTopRef.current.classList.add("fade-out");
        scrollToTopRef.current.addEventListener(
          "animationend",
          function handler() {
            // In case the user scrolled between the start and end of the animation, only hide the
            // popover if `isScrollToTopVisible` wasn't set to true during the animation.
            if (!isScrollToTopVisible.current) {
              scrollToTopRef.current.hidePopover();
            }
            scrollToTopRef.current.classList.remove("fade-out");
            scrollToTopRef.current.removeEventListener("animationend", handler);
          }
        );
      }
    }
  }

  // Detect if the user has scrolled at least 100px down from the top of the page.
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > SCROLLTOTOP_MARGIN) {
        scrollToTopVisibility(true);
      } else {
        scrollToTopVisibility(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div popover="manual" ref={scrollToTopRef} id="scroll-to-top">
      <ControlShape onClick={scrollToTop} />
    </div>
  );
}
