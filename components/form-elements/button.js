/**
 * Standard button types so that most buttons on the site have the same look and feel. These include
 * primary, secondary, warning, and selected buttons as well as disabled versions of each, and
 * they come in three sizes: small (sm), medium (md), and large (lg). Use selected buttons only for
 * attached buttons to show which one is selected, if that's relevant to your use case.
 *
 * This module includes regular buttons that call a function when clicked as well as buttons that
 * navigate to a new page when clicked. Use the latter sparingly as most links should appear as
 * links, not buttons.
 *
 * Both regular and link buttons support an icon-only version using the `hasIconOnly` property.
 *
 * This module also includes the <AttachedButtons> component that you can use to group buttons
 * together in a row, and appear attached to each other.
 *
 * Don't think *all* buttons on the site need to use these components. Special-use buttons can just
 * use the `<button>` element directly. But these should serve as your go-to buttons for the vast
 * majority of cases.
 */

// node_modules
import PropTypes from "prop-types";
import React from "react";
// components
import Link from "../link-no-prefetch";
// lib
import { LINK_INLINE_STYLE } from "../../lib/constants";
import { generateButtonClasses } from "../../lib/form-elements";

/**
 * Generate the Tailwind CSS classes for the button to appear inline with text when requested.
 * @param {boolean} isInline True to style the button to appear inline with text
 * @returns {string} Tailwind CSS classes for the button to appear inline with text when needed
 */
function inlineClasses(isInline) {
  return isInline ? "inline-flex" : "flex";
}

/*
 * Displays a button with a site-standard style. Use this for buttons that perform an action; not
 * for buttons that navigate to a new page -- use <ButtonLink> for those. Supply any content you
 * want as the button label including text, icons, both, or a React component.
 *
 * <Button type="warning" size="lg" onClick={clickHandler}>
 *   Click me! <DecorativeIcon />
 * </Button>
 */
export function Button({
  onClick,
  label = null,
  id = null,
  type = "primary",
  size = "md",
  hasIconOnly = false,
  hasIconCircleOnly = false,
  role = "button",
  isInline = false,
  isSelected = null,
  isDisabled = false,
  className = "",
  children,
}) {
  const buttonClasses = generateButtonClasses(
    type,
    size,
    hasIconOnly,
    hasIconCircleOnly
  );

  return (
    <button
      type="button"
      role={role}
      id={id}
      data-testid={id}
      onClick={onClick}
      className={`${inlineClasses(isInline)} ${buttonClasses} ${className}`}
      aria-label={label}
      aria-checked={isSelected}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  // Called when the button is clicked
  onClick: PropTypes.func.isRequired,
  // Accessible label of the button if the button text is not sufficient for screen readers
  label: PropTypes.string,
  // HTML ID of the button element
  id: PropTypes.string,
  // Button prefab color and style
  type: PropTypes.oneOf(["primary", "secondary", "warning", "selected"]),
  // Button sizes
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // True for buttons that only contain an icon; makes the padding work better for these
  hasIconOnly: PropTypes.bool,
  // True for buttons that only contain an icon in a circular button
  hasIconCircleOnly: PropTypes.bool,
  // Role of the button if not "button"
  role: PropTypes.string,
  // True to make the button appear inline with text
  isInline: PropTypes.bool,
  // True for selected buttons; only use for attached buttons to show which one is selected
  isSelected: PropTypes.bool,
  // True to disable the button
  isDisabled: PropTypes.bool,
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
};

Button.displayName = "Button";

/**
 * Return a <Link> element for internal links, and an <a> element for external links.
 */
function LinkElement(props) {
  const { isExternal } = props;

  // Make a copy of `props` but without `isExternal` in case it was included.
  const { isExternal: _, ...propsWithoutExceptions } = props;

  if (isExternal) {
    return (
      <a
        {...propsWithoutExceptions}
        target="_blank"
        rel="noopener noreferrer"
      />
    );
  }
  return <Link {...propsWithoutExceptions} />;
}

LinkElement.propTypes = {
  // True for external links
  isExternal: PropTypes.bool,
};

/**
 * Displays a button that links to a URL instead of performing an action. When these
 * are "disabled" they show just the children element using the "disabled" CSS.
 *
 * <ButtonLink href="/path/to/page">
 *   Go Here!
 * </ButtonLink>
 */
export function ButtonLink({
  href,
  label = null,
  id = null,
  type = "primary",
  size = "md",
  hasIconOnly = false,
  hasIconCircleOnly = false,
  isInline = false,
  isDisabled = false,
  isExternal = false,
  className = "",
  children,
}) {
  const maybeDisabledType = isDisabled ? `${type}Disabled` : type;

  const buttonClasses = generateButtonClasses(
    maybeDisabledType,
    size,
    hasIconOnly,
    hasIconCircleOnly
  );
  return isDisabled ? (
    <div
      aria-label={label}
      id={id}
      className={`text-center no-underline ${inlineClasses(
        isInline
      )} ${buttonClasses} ${className}`}
    >
      {children}
    </div>
  ) : (
    <LinkElement
      isExternal={isExternal}
      href={href}
      aria-label={label}
      id={id}
      className={`text-center no-underline ${inlineClasses(
        isInline
      )} ${buttonClasses} ${className}`}
    >
      {children}
    </LinkElement>
  );
}

ButtonLink.propTypes = {
  // Link that pressing the button will navigate to
  href: PropTypes.string.isRequired,
  // Accessible label of the button if the button text is not sufficient for screen readers
  label: PropTypes.string,
  // HTML ID of the button element
  id: PropTypes.string,
  // Button color type
  type: PropTypes.oneOf(["primary", "secondary", "warning", "selected"]),
  // Button sizes
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // True for buttons that only contain an icon; makes the padding work better for these
  hasIconOnly: PropTypes.bool,
  // True for buttons that only contain an icon in a circular button
  hasIconCircleOnly: PropTypes.bool,
  // True to make the button appear inline with text
  isInline: PropTypes.bool,
  // Is Disabled
  isDisabled: PropTypes.bool,
  // True if the link is external
  isExternal: PropTypes.bool,
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
};

/**
 * Wrapper for buttons that appear attached to each other on one line. We usually use this for
 * buttons that let the user choose between options, sort of like tabs but in places where tabs
 * don't make sense. Simply wrap <Button> or <ButtonLink> components in this component. Make sure
 * none of the buttons has content to make one button taller than the others or you'll see an
 * awkward height difference.
 *
 * Be careful with mobile. We don't yet support good degradation of this component if the space it
 * exists in is too narrow. For now, make sure these buttons can appear side by side even on
 * mobile. Once Firefox supports container queries, we can use those to make this component degrade
 * gracefully.
 *
 * See https://github.com/tailwindlabs/tailwindcss-container-queries for a Tailwind CSS plugin that
 * adds container queries to Tailwind CSS.
 */
export function AttachedButtons({ testid = null, className = "", children }) {
  // Modify the borders and corner roundness of the child buttons so they look attached to each
  // other.
  const moddedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        className: `${
          child.props.className || ""
        } border-r-0 last:border-r rounded-none first:rounded-l last:rounded-r`,
      });
    }
    return child;
  });

  return (
    <div data-testid={testid} className={`flex ${className}`}>
      {moddedChildren}
    </div>
  );
}

AttachedButtons.propTypes = {
  // data-testid attribute for testing
  testid: PropTypes.string,
  // Additional Tailwind CSS classes to apply to the wrapper element
  className: PropTypes.string,
};

/**
 * Renders a button that appears like a link. Best used for buttons that appear inline with text.
 */
export function ButtonAsLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline underline ${LINK_INLINE_STYLE}`}
    >
      {children}
    </button>
  );
}

ButtonAsLink.propTypes = {
  // Called when the button is clicked
  onClick: PropTypes.func.isRequired,
};
