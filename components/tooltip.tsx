/**
 * This module lets you have a tooltip that appears when the user hovers over an element. For
 * documentation, see `./docs/tooltip.md`.
 */

// node_modules
import {
  arrow,
  autoPlacement,
  FloatingArrow,
  offset,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  type FloatingContext,
  type ReferenceType,
} from "@floating-ui/react";
import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * ID of the tooltip portal DOM root-level element that tooltips render into to avoid z-index and
 * parent-width issues.
 */
const TOOLTIP_PORTAL_ROOT_ID = "tooltip-portal-root";

/**
 * Height of the tooltip arrow (the small pointer from the tooltip to the tooltip ref) in pixels.
 */
const ARROW_HEIGHT = 10;

/**
 * Width of the tooltip arrow in pixels is the height * 1.4, rounded to the nearest whole number.
 */
const ARROW_WIDTH = Math.round(ARROW_HEIGHT * 1.4);

/**
 * Milliseconds to delay before showing or hiding the tooltip.
 */
const TOOLTIP_DELAY = 500;

/**
 * Attributes returned by the `useTooltip()` hook that you need to pass to both `<TooltipRef>` and
 * `<Tooltip>`.
 */
export type TooltipAttr = {
  id: string;
  refEl: (node: ReferenceType | null) => void;
  refProps: () => Record<string, unknown>;
  tooltipEl: (node: HTMLElement | null) => void;
  tooltipProps: () => Record<string, unknown>;
  context: FloatingContext;
  arrowRef: React.RefObject<SVGSVGElement>;
  styles: React.CSSProperties;
  isVisible: boolean;
};

/**
 * Call this custom hook within any component that contains a tooltip. It returns props that you
 * need to pass to both `<TooltipRef>` and `<Tooltip>`. It can only control one tooltip, so if you
 * need to have more than one, you need to call this hook once for each tooltip.
 *
 * You generally assign the return results to a variable named `tooltipAttr`, and then pass that
 * variable to both `<TooltipRef>` and `<Tooltip>` in their `tooltipAttr` properties.
 *
 * Each tooltip needs an ID unique within the page, which you pass to this hook. It gets used for
 * accessibility.
 *
 * These tooltips use the `floating-ui` npm package. See their documentation at:
 * https://floating-ui.com/docs/react
 *
 * @param {string} id Unique ID for the tooltip
 * @returns {object} Object with props for `<TooltipRef>` and `<Tooltip>`
 */
export function useTooltip(id: string): TooltipAttr {
  const [isVisible, setIsVisible] = useState(false);
  const arrowRef = useRef<SVGSVGElement>(null);

  const { context, floatingStyles, refs } = useFloating<HTMLButtonElement>({
    middleware: [
      autoPlacement(),
      shift(),
      arrow({ element: arrowRef }),
      offset(ARROW_HEIGHT),
    ],
    onOpenChange: setIsVisible,
    open: isVisible,
  });

  const hover = useHover(context, {
    delay: TOOLTIP_DELAY,
  });
  const focus = useFocus(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
  ]);

  // Return the tooltip attributes that ties together a <TooltipRef>/<Tooltip> pair.
  return {
    id: `tooltip-${toShishkebabCase(id)}`,
    refEl: refs.setReference,
    refProps: getReferenceProps,
    tooltipEl: refs.setFloating,
    tooltipProps: getFloatingProps,
    context,
    arrowRef,
    styles: floatingStyles,
    isVisible,
  };
}

/**
 * Wrap the element that you want to trigger the tooltip with this component. You can only wrap one
 * element; more than one causes an error. This tooltip ref wrapper can contain any kind of HTML
 * element or custom React component without modifying the child element itself.
 *
 * For DOM elements, we clone the child to attach tooltip handlers/refs directly. For custom React
 * components (which might not forward refs/props), we wrap them in a simple wrapper element that
 * receives the tooltip handlers/refs so we don't interfere with the child's own event handling.
 *
 * @param tooltipAttr - Object returned by `useTooltip()` that contains props to pass to this and the
 *   corresponding `<Tooltip>` component
 */
export function TooltipRef({
  tooltipAttr,
  children,
}: {
  tooltipAttr: TooltipAttr;
  children: React.ReactNode;
}) {
  // Make sure only one child exists.
  const child = Children.only(children);

  // Check if this is a DOM element (oddly indicated by the string type) or a custom component. We
  // can safely clone and add props directly to DOM elements.
  const isDOMElement = isValidElement(child) && typeof child.type === "string";
  if (isDOMElement) {
    const clonedElement = cloneElement(child, {
      ref: tooltipAttr.refEl,
      "aria-describedby": tooltipAttr.id,
      ...tooltipAttr.refProps(),
    });
    return <>{clonedElement}</>;
  }

  // For custom components, use a wrapper that receives the tooltip handlers and reference. We keep
  // this wrapper lightweight and let events bubble from the child so we don't block interactions.
  return (
    <span
      className="inline-block"
      ref={tooltipAttr.refEl}
      aria-describedby={tooltipAttr.id}
      {...tooltipAttr.refProps()}
    >
      {child}
    </span>
  );
}

/**
 * Wrap the content that you want to show in the tooltip with this component. It can contain one or
 * many elements. Make sure your content works with both light and dark mode, and with different
 * browser widths.
 *
 * @param tooltipAttr - Object returned by `useTooltip()` that contains props to pass to this and the
 *   corresponding `<TooltipRef>` component
 */
export function Tooltip({
  tooltipAttr,
  children,
}: {
  tooltipAttr: TooltipAttr;
  children: React.ReactNode;
}) {
  return (
    <>
      {tooltipAttr.isVisible &&
        createPortal(
          <div
            className="z-100 max-w-[90%] rounded-md border border-gray-500 bg-gray-800 px-2 py-1 text-xs text-white drop-shadow-md md:max-w-[40%] 2xl:max-w-[20%] dark:border-white dark:bg-gray-300 dark:text-black"
            ref={tooltipAttr.tooltipEl}
            style={tooltipAttr.styles}
            role="tooltip"
            {...tooltipAttr.tooltipProps()}
            id={tooltipAttr.id}
            data-testid={tooltipAttr.id}
          >
            {children}
            <FloatingArrow
              className="fill-gray-800 dark:fill-gray-300 [&>path:first-of-type]:stroke-gray-500 dark:[&>path:first-of-type]:stroke-white [&>path:last-of-type]:stroke-gray-800 dark:[&>path:last-of-type]:stroke-gray-300"
              ref={tooltipAttr.arrowRef}
              context={tooltipAttr.context}
              height={ARROW_HEIGHT}
              width={ARROW_WIDTH}
              strokeWidth={1}
            />
          </div>,
          document.getElementById(TOOLTIP_PORTAL_ROOT_ID)
        )}
    </>
  );
}

/**
 * Drop this component into the `<body>` of your HTML document. It creates the DOM root-level
 * portal that the tooltips render into.
 */
export function TooltipPortalRoot() {
  return (
    <div id={TOOLTIP_PORTAL_ROOT_ID} data-testid={TOOLTIP_PORTAL_ROOT_ID} />
  );
}
