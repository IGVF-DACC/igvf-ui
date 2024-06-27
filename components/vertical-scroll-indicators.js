// node_modules
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { Children, useCallback, useEffect, useRef, useState } from "react";

/**
 * Number of milliseconds to wait before hiding the scroll indicators.
 */
const SCROLL_INDICATOR_TIMEOUT = 2000;

/**
 * Display either the top or bottom scroll indicators.
 */
function ScrollIndicator({ className = "", children }) {
  // Add common Tailwind CSS classes to each child button.
  const childrenWithStyles = Children.map(children, (child) => {
    return child && typeof child === "object"
      ? {
          ...child,
          props: {
            ...child.props,
            className:
              "h-8 w-8 text-white rounded-full bg-brand opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none",
          },
        }
      : child;
  });

  // Easier ways to horizontally center the scroll indicators exist than using a transform, but
  // they prevent the user from clicking checkboxes to the left or right of either indicator.
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 transform ${className}`}
    >
      {childrenWithStyles}
    </div>
  );
}

ScrollIndicator.propTypes = {
  // Tailwind CSS classes to add to the scroll indicator wrapper
  className: PropTypes.string,
};

/**
 * Display the top scroll indicator to show the user that more content exists above the current
 * view.
 */
function ScrollIndicatorTop({ onClick, onHover }) {
  return (
    <ScrollIndicator className="top-2">
      <button
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        aria-label="Scroll column selector to the top"
      >
        <ChevronUpIcon />
      </button>
    </ScrollIndicator>
  );
}

ScrollIndicatorTop.propTypes = {
  // Called when the user clicks the up scroll indicator
  onClick: PropTypes.func.isRequired,
  // Called when the user hovers over the scroll indicator, or stops hovering
  onHover: PropTypes.func.isRequired,
};

/**
 * Display the bottom scroll indicator to show the user that more content exists below the current
 * view.
 */
function ScrollIndicatorBottom({ onClick, onHover }) {
  return (
    <ScrollIndicator className="bottom-2">
      <button
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        aria-label="Scroll column selector to the bottom"
      >
        <ChevronDownIcon />
      </button>
    </ScrollIndicator>
  );
}

ScrollIndicatorBottom.propTypes = {
  // Called when the user clicks the bottom scroll indicator
  onClick: PropTypes.func.isRequired,
  // Called when the user hovers over the bottom scroll indicator, or stops hovering
  onHover: PropTypes.func.isRequired,
};

/**
 * Code to use to scroll to the top of the page.
 */
const SCROLL_DIRECTION_TOP = "SCROLL_TO_TOP";

/**
 * Code to scroll to the bottom of the page.
 */
const SCROLL_DIRECTION_BOTTOM = "SCROLL_TO_BOTTOM";

/**
 * Display the scroll indicators to show the user that there is more content above or below the
 * current view.
 */
export default function VerticalScrollIndicators({ scrollAreaRef }) {
  // True if content exists above the scrollable checkbox area
  const [isScrollableUp, setIsScrollableUp] = useState(false);
  // True if content exists below the scrollable checkbox area
  const [isScrollableDown, setIsScrollableDown] = useState(false);

  const scrollTimer = useRef(null);
  const isHoveringOverScrollIndicators = useRef(false);

  // Use a ref to store the parent scroll area ref to avoid a stale closure when adding or
  // removing event listeners.
  const localScrollAreaRef = useRef(scrollAreaRef.current);

  // Scroll the checkbox area to the top or bottom when the user clicks the scroll indicators.
  function scrollIndicatorClick(scrollDirection) {
    let topCoordinate;
    if (scrollDirection === SCROLL_DIRECTION_TOP) {
      topCoordinate = 0;
    } else {
      topCoordinate = scrollAreaRef.current.scrollHeight;
    }
    scrollAreaRef.current.scrollTo({ top: topCoordinate, behavior: "smooth" });
    isHoveringOverScrollIndicators.current = false;
  }

  // Update the visibility of the scroll indicators based on the current scroll position. Manage
  // the timer to hide the scroll indicators when the user hasn't scrolled for a while. Cache this
  // function because we need the same function instance to add and remove as an event listener.
  const onUpdateScroll = useCallback(() => {
    // Clear the scroll timer when the user scrolls.
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
      scrollTimer.current = null;
    }

    // Don't restart the timer while the user hovers over the scroll indicators.
    if (!isHoveringOverScrollIndicators.current) {
      scrollTimer.current = setTimeout(() => {
        // The timer has expired with no scrolling, so hide the scroll indicators.
        scrollTimer.current = null;
        setIsScrollableUp(false);
        setIsScrollableDown(false);
      }, SCROLL_INDICATOR_TIMEOUT);
    }

    // Determine which scroll indicators to display based on the current scroll position.
    setIsScrollableUp(scrollAreaRef.current.scrollTop > 0);
    setIsScrollableDown(
      scrollAreaRef.current.scrollTop + scrollAreaRef.current.clientHeight <
        scrollAreaRef.current.scrollHeight
    );
  }, []);

  // Update the scroll indicators when the user hovers over either one, or stops hovering over them.
  function onHoverOverScrollIndicators(isHovering) {
    isHoveringOverScrollIndicators.current = isHovering;
    onUpdateScroll();
  }

  // Update the local scroll area ref when the parent scroll area ref changes so that closures get
  // the current parent DOM ref.
  useEffect(() => {
    localScrollAreaRef.current = scrollAreaRef.current;
  }, [scrollAreaRef]);

  // Add scroll and resize event handlers to know whether to display the scroll indicators.
  useEffect(() => {
    // Install the scroll event listener and element resize observer.
    localScrollAreaRef.current.addEventListener("scroll", onUpdateScroll);
    const resizeObserver = new ResizeObserver(() => {
      onUpdateScroll();
    });
    resizeObserver.observe(localScrollAreaRef.current);

    // Clean up the event listeners when the component is unmounted.
    return () => {
      localScrollAreaRef.current.removeEventListener("scroll", onUpdateScroll);
      resizeObserver.disconnect();
    };
  }, [localScrollAreaRef]);

  return (
    <>
      {isScrollableUp && (
        <ScrollIndicatorTop
          onClick={() => scrollIndicatorClick(SCROLL_DIRECTION_TOP)}
          onHover={onHoverOverScrollIndicators}
        />
      )}
      {isScrollableDown && (
        <ScrollIndicatorBottom
          onClick={() => scrollIndicatorClick(SCROLL_DIRECTION_BOTTOM)}
          onHover={onHoverOverScrollIndicators}
        />
      )}
    </>
  );
}

VerticalScrollIndicators.propTypes = {
  // DOM reference to the scrollable area that these indicators appear in and control
  scrollAreaRef: PropTypes.object.isRequired,
};
