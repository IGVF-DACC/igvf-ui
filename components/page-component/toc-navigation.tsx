// node_modules
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "motion/react";
import { type MouseEvent, useId, useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../animation";
// lib
import { REMARK_CLOBBER_PREFIX } from "../../lib/markdown";
// local
import { type PluginProps } from "./types";

/**
 * Detect whether the user prefers reduced motion. Falls back to `false` in non-browser contexts.
 *
 * @returns `true` if the user prefers reduced motion, `false` otherwise.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scrolls the page to the target element corresponding to the provided anchor link. The scrolling
 * behavior is smooth unless the user has requested reduced motion in their system preferences.
 *
 * @param event - Mouse click event to trigger scrolling to the target
 * @param href - anchor link attached to the TOC item
 */
function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const target = document.getElementById(href.slice(1));
  if (!target) {
    return;
  }

  event.preventDefault();

  // Determine if the user has requested reduced motion and adjust the scroll behavior accordingly.
  const reduceMotion = prefersReducedMotion();

  // Scroll the target element into view with smooth scrolling, unless the user has requested
  // reduced motion.
  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });

  // Ensure the target element is focusable for accessibility. If it doesn't have a tabindex, set it
  // to -1.
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });

  // Update the browser's history state to reflect the new anchor without causing a page reload.
  window.history.pushState(null, "", href);
}

/**
 * Displays a table of contents with links to different sections of the page.
 *
 * @param items - Object mapping item titles to their corresponding hrefs. Each key is a title for
 *                each section
 */
export default function TocNavigation(items: PluginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  // Evaluate the preference at render time to avoid relying on a motion hook export in tests.
  const shouldReduceMotion = prefersReducedMotion();

  // Filter properties to leave only those with valid anchor hrefs, i.e. those that start with "#" and contains
  // alpha-numeric characters and dashes.
  const validItems: PluginProps = Object.fromEntries(
    Object.entries(items).filter(([_, href]) => /^#[a-zA-Z0-9-]+$/.test(href))
  );

  // Don't render anything if no valid items are present. This prevents rendering an empty TOC when
  // the page has no headings.
  if (Object.keys(validItems).length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="my-4 w-fit max-w-full">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex cursor-pointer items-center gap-1 rounded-tl-sm rounded-tr-sm pr-2 font-bold uppercase ${isOpen ? "bg-toc-nav-header text-white" : "text-toc-nav-header-label"}`}
        data-testid="toc-toggle-button"
      >
        {isOpen ? (
          <MinusIcon aria-hidden="true" className="size-5 shrink-0" />
        ) : (
          <PlusIcon aria-hidden="true" className="size-5 shrink-0" />
        )}

        <span>Table of Contents</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            key="toc-content"
            initial={shouldReduceMotion ? false : "collapsed"}
            animate={shouldReduceMotion ? undefined : "open"}
            exit={shouldReduceMotion ? undefined : "collapsed"}

            variants={standardAnimationVariants}
            transition={standardAnimationTransition}
            className="border-toc-nav-outline overflow-hidden rounded-tr-sm rounded-br-sm rounded-bl-sm border"
          >
            <ul
              className="my-1 ml-2 w-max max-w-[calc(100%-0.5rem)] py-2 pr-2"
              data-testid="toc-content"
            >
              {Object.entries(validItems).map((item) => {
                const [title, href] = item;
                const processedHref = `#${REMARK_CLOBBER_PREFIX}-${href.slice(1)}`;

                return (
                  <li key={title}>
                    <a
                      onClick={(event) => scrollToAnchor(event, processedHref)}
                      href={processedHref}
                      className="hover:bg-nav-highlight block rounded-full px-4 py-1 leading-5 no-underline"
                    >
                      {title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
