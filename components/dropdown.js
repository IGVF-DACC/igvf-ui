/**
 * This module lets you have a button that displays a dropdown when clicked. The dropdown can
 * contain any content. See the documentation in ./docs/dropdown.md for details.
 */

// node_modules
import PropTypes from "prop-types";
import {
  autoPlacement,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { Children, cloneElement, useState } from "react";
import { createPortal } from "react-dom";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * ID of the dropdown portal DOM root-level element that dropdowns render into to avoid z-index
 * and parent-width issues.
 */
const DROPDOWN_PORTAL_ROOT_ID = "dropdown-portal-root";

/**
 * Pass any of these values for the `type` property of `<DropdownRef>`. This gets assigned to the
 * `aria-haspopup` attribute of the dropdown reference child element. See:
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup#values
 */
export const DROPDOWN_TYPE_TRUE = "true";
export const DROPDOWN_TYPE_MENU = "menu";
export const DROPDOWN_TYPE_LISTBOX = "listbox";
export const DROPDOWN_TYPE_TREE = "tree";
export const DROPDOWN_TYPE_GRID = "grid";
export const DROPDOWN_TYPE_DIALOG = "dialog";

/**
 * Pass either of these values for the `alignment` argument to `useDropdown()` to have the dropdown
 * appear left aligned or right aligned with the dropdown reference.
 */
export const DROPDOWN_ALIGN_LEFT = "DROPDOWN_ALIGN_LEFT";
export const DROPDOWN_ALIGN_RIGHT = "DROPDOWN_ALIGN_RIGHT";

/**
 * Values to assign to `allowedPlacements` in the `autoPlacement()` middleware for both left- and
 * right-aligned dropdowns.
 */
const placements = {
  DROPDOWN_ALIGN_LEFT: ["top-start", "bottom-start"],
  DROPDOWN_ALIGN_RIGHT: ["top-end", "bottom-end"],
};

/**
 * Call this custom hook within any component that uses a dropdown. It returns props that you pass
 * to both `<DropdownRef>` and `<Dropdown>`. It can only control one dropdown, so if you need to
 * have more than one, you need to call this hook once for each dropdown.
 *
 * You generally assign the return results to a variable named `dropdownAttr`, and then pass that
 * variable to both `<DropdownRef>` and `<Dropdown>` in their `dropdownAttr` properties.
 *
 * Each dropdown needs an ID unique within the page, which you pass to this hook. It gets used for
 * accessibility.
 *
 * These dropdowns use the `floating-ui` npm package. See their documentation at:
 * https://floating-ui.com/docs/react
 *
 * @param {string} id Unique ID for the dropdown
 * @param {string} alignment Either `DROPDOWN_ALIGN_LEFT` or `DROPDOWN_ALIGN_RIGHT`
 * @returns {object} Object with props for `<DropdownRef>` and `<Dropdown>`
 */
export function useDropdown(id, alignment = DROPDOWN_ALIGN_LEFT) {
  // True if the dropdown is visible
  const [isVisible, setIsVisible] = useState(false);

  // Get the allowed placements for the dropdown.
  const allowedPlacements = placements[alignment];
  if (!allowedPlacements) {
    throw new Error(`Invalid value for alignment: ${alignment}`);
  }

  // Set up the floating UI for the dropdown.
  const { context, floatingStyles, refs } = useFloating({
    middleware: [autoPlacement({ allowedPlacements }), shift(), offset(4)],
    onOpenChange: setIsVisible,
    open: isVisible,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  // Return the dropdown attributes that ties together a <DropdownRef>/<Dropdown> pair. Client
  // components should consider this object mostly opaque. They should only read and mutate the
  // `isVisible` property.
  return {
    id: `dropdown-${toShishkebabCase(id)}`,
    refEl: refs.setReference,
    refProps: getReferenceProps,
    dropdownEl: refs.setFloating,
    dropdownProps: getFloatingProps,
    context,
    styles: floatingStyles,

    // Public getter and setter for the `isVisible` React state.
    get isVisible() {
      return isVisible;
    },
    set isVisible(value) {
      setIsVisible(value);
    },
  };
}

/**
 * Wrap the element that you want to trigger the dropdown with this component. You can only wrap one
 * element; more than one causes an error visible in the console. This dropdown ref wrapper normally
 * contains a button, as `<DropdownRef>` assigns a click handler to its child, making a button a
 * natural child element.
 */
export function DropdownRef({
  dropdownAttr,
  type = DROPDOWN_TYPE_TRUE,
  children,
}) {
  // Make sure only one child exists. Add the floating-ui refs and its other props to this child.
  const child = Children.only(children);
  const clonedElement = cloneElement(child, {
    id: `${dropdownAttr.id}-ref`,
    "aria-expanded": dropdownAttr.isVisible,
    "aria-haspopup": type,
    ref: dropdownAttr.refEl,
    ...dropdownAttr.refProps(),
  });

  return <>{clonedElement}</>;
}

DropdownRef.propTypes = {
  // Object returned by `dropdownAttr()`
  dropdownAttr: PropTypes.shape({
    id: PropTypes.string,
    refEl: PropTypes.func,
    refProps: PropTypes.func,
    isVisible: PropTypes.bool,
  }),
  // Value to assign to `aria-haspopup` attribute of the dropdown reference
  type: PropTypes.oneOf([
    DROPDOWN_TYPE_TRUE,
    DROPDOWN_TYPE_MENU,
    DROPDOWN_TYPE_LISTBOX,
    DROPDOWN_TYPE_TREE,
    DROPDOWN_TYPE_GRID,
    DROPDOWN_TYPE_DIALOG,
  ]),
};

/**
 * Wrap the content that you want to show in the dropdown with this component. This content can
 * comprise one or many elements. Make sure your content works with both light and dark mode, and
 * with different browser widths and heights.
 */
export function Dropdown({ dropdownAttr, className = null, children }) {
  return (
    <>
      {dropdownAttr.isVisible &&
        createPortal(
          <div
            id={dropdownAttr.id}
            data-testid={dropdownAttr.id}
            aria-labelledby={`${dropdownAttr.id}-ref`}
            className={
              className || "rounded-sm border border-panel bg-panel shadow-lg"
            }
            ref={dropdownAttr.dropdownEl}
            style={dropdownAttr.styles}
            role="menu"
            {...dropdownAttr.dropdownProps()}
          >
            {children}
          </div>,
          document.getElementById(DROPDOWN_PORTAL_ROOT_ID)
        )}
    </>
  );
}

Dropdown.propTypes = {
  // Object returned by `useDropdown()`
  dropdownAttr: PropTypes.shape({
    id: PropTypes.string,
    dropdownEl: PropTypes.func,
    dropdownProps: PropTypes.func,
    context: PropTypes.object,
    styles: PropTypes.object,
    isVisible: PropTypes.bool,
  }),
  // Tailwind CSS classes to assign to the dropdown wrapper
  className: PropTypes.string,
};

/**
 * Drop this component into the `<body>` of your HTML document. It creates the DOM root-level
 * portal that the dropdowns render into.
 */
export function DropdownPortalRoot() {
  return (
    <div id={DROPDOWN_PORTAL_ROOT_ID} data-testid={DROPDOWN_PORTAL_ROOT_ID} />
  );
}
