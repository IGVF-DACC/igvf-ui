// node_modules
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";

/* istanbul ignore file */
// JSDom doesn't support layout, so we cannot generate the conditions to render the scroll
// indicators during a Jest test. These components are isolated in this file so we can have
// coveralls (istanbul) ignore them.

/**
 * Renders a single left- or right-pointing scroll indicator that fades out after appearing. Don't
 * attempt to compose the left-5 and right-5 Tailwind CSS classes or they'll get tree shaken.
 */
function ScrollIndicator({ direction, children }) {
  return (
    <motion.div
      initial="visible"
      animate="hidden"
      variants={{ visible: { opacity: 1 }, hidden: { opacity: 0 } }}
      transition={{ duration: 2 }}
      className={`absolute top-5 h-10 w-10 bg-slate-500 ${
        direction === "left" ? "left-5" : "right-5"
      }`}
      data-testid={`scroll-indicator-${direction}`}
    >
      {children}
    </motion.div>
  );
}

ScrollIndicator.propTypes = {
  // Direction of the scroll indicator
  direction: PropTypes.oneOf(["left", "right"]).isRequired,
};

/**
 * Wrapper around the data grid to show scroll indicators when the table is horizontally scrollable.
 */
// coverage:ignore-line to ignore one line.
export default function ScrollIndicators({ gridRef, children }) {
  // True if the table can be scrolled to the right
  const [isScrollableRight, setIsScrollableRight] = useState(false);
  // True if the table can be scrolled to the left
  const [isScrollableLeft, setIsScrollableLeft] = useState(false);

  /**
   * Called when the mouse enters anywhere in the table. Determines whether the table can be
   * scrolled to the right or left.
   */
  function onPointerEnter() {
    // Determine if any portion of the table exists to the right of the visible portion.
    const isRightScrollable =
      gridRef.current.scrollWidth - Math.round(gridRef.current.scrollLeft) !==
      gridRef.current.clientWidth;
    setIsScrollableRight(isRightScrollable);

    // Determine if any portion of the table exists to the left of the visible portion.
    const isLeftScrollable = gridRef.current.scrollLeft > 0;
    setIsScrollableLeft(isLeftScrollable);
  }

  /**
   * Called when the mouse exits the table. Remove the scroll indicators from the DOM.
   */
  function onPointerLeave() {
    setIsScrollableRight(false);
    setIsScrollableLeft(false);
  }

  return (
    <div
      className="relative"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {isScrollableLeft && (
        <ScrollIndicator direction="left">
          <ChevronLeftIcon className="fill-white" />
        </ScrollIndicator>
      )}
      {isScrollableRight && (
        <ScrollIndicator direction="right">
          <ChevronRightIcon className="fill-white" />
        </ScrollIndicator>
      )}
      {children}
    </div>
  );
}

ScrollIndicators.propTypes = {
  // Ref to the table DOM element
  gridRef: PropTypes.object.isRequired,
};
