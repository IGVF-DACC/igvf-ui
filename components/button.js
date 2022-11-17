/**
 * Standard button types so that all buttons on the site have the same look and feel.
 */

// node_modules
import PropTypes from "prop-types";
import React, { Children, cloneElement } from "react";
import { useRouter } from "next/router";

/**
 * Background colors for each of the button types.
 */
const buttonTypeClasses = {
  primary: "bg-button-primary disabled:bg-button-primary-disabled",
  secondary: "bg-button-secondary disabled:bg-button-secondary-disabled",
  tertiary: "bg-button-tertiary disabled:bg-button-tertiary-disabled",
  error: "bg-button-error disabled:bg-button-error-disabled",
  warning: "bg-button-warning disabled:bg-button-warning-disabled",
  success: "bg-button-success disabled:bg-button-success-disabled",
  info: "bg-button-info disabled:bg-button-info-disabled",

  "primary-outline": "bg-transparent",
  "secondary-outline": "bg-transparent",
  "tertiary-outline": "bg-transparent",
  "error-outline": "bg-transparent",
  "warning-outline": "bg-transparent",
  "success-outline": "bg-transparent",
  "info-outline": "bg-transparent",
};

/**
 * Border colors for each of the button types.
 */
const borderTypeClasses = {
  primary: "border-button-primary disabled:border-button-primary-disabled",
  secondary:
    "border-button-secondary disabled:border-button-secondary-disabled",
  tertiary: "border-button-tertiary disabled:border-button-tertiary-disabled",
  error: "border-button-error disabled:border-button-error-disabled",
  warning: "border-button-warning disabled:border-button-warning-disabled",
  success: "border-button-success disabled:border-button-success-disabled",
  info: "border-button-info disabled:border-button-info-disabled",

  "primary-outline":
    "border-button-primary disabled:border-button-primary-disabled",
  "secondary-outline":
    "border-button-secondary disabled:border-button-secondary-disabled",
  "tertiary-outline":
    "border-button-tertiary disabled:border-button-tertiary-disabled",
  "error-outline": "border-button-error disabled:border-button-error-disabled",
  "warning-outline":
    "border-button-warning disabled:border-button-warning-disabled",
  "success-outline":
    "border-button-success disabled:border-button-success-disabled",
  "info-outline": "border-button-info disabled:border-button-info-disabled",
};

/**
 * Text colors for each of the outlined button types.
 */
const buttonTextTypeClasses = {
  primary: "text-white",
  secondary: "text-white",
  tertiary: "text-white",
  error: "text-white",
  warning: "text-white",
  success: "text-white",
  info: "text-white",

  "primary-outline":
    "text-button-primary disabled:text-button-primary-disabled",
  "secondary-outline":
    "text-button-secondary disabled:text-button-secondary-disabled",
  "tertiary-outline":
    "text-button-tertiary disabled:text-button-tertiary-disabled",
  "error-outline": "text-button-error disabled:text-button-error-disabled",
  "warning-outline":
    "text-button-warning disabled:text-button-warning-disabled",
  "success-outline":
    "text-button-success disabled:text-button-success-disabled",
  "info-outline": "text-button-info disabled:text-button-info-disabled",
};

/**
 * SVG fill colors for each of the button types.
 */
const buttonFillTypeClasses = {
  primary: "fill-white",
  secondary: "fill-white",
  tertiary: "fill-white",
  error: "fill-white",
  warning: "fill-white",
  success: "fill-white",
  info: "fill-white",

  "primary-outline": "fill-button-primary",
  "secondary-outline": "fill-button-secondary",
  "tertiary-outline": "fill-button-tertiary",
  "error-outline": "fill-button-error",
  "warning-outline": "fill-button-warning",
  "success-outline": "fill-button-success",
  "info-outline": "fill-button-info",
};

/**
 * Tailwind CSS classes for each of the button sizes.
 */
const buttonSizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-4 py-1 text-sm",
  lg: "px-6 py-2 text-base",
};

/**
 * Button component to make all buttons consistent across the site. Use this component to wrap the
 * contents of a button:
 *
 * <Button type="info" size="lg">
 *   Click me!
 * </Button>
 */
const Button = ({
  onClick,
  label = "",
  id = null,
  type = "primary",
  size = "md",
  className = "",
  disabled = false,
  children,
}) => {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`flex items-center justify-center rounded border font-semibold ${buttonSizeClasses[size]} ${buttonTypeClasses[type]} ${borderTypeClasses[type]} ${buttonTextTypeClasses[type]} ${className}`}
      aria-label={label}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  // Called when the button is clicked
  onClick: PropTypes.func.isRequired,
  // Accessible label of the button if the button text is not sufficient for screen readers
  label: PropTypes.string,
  // HTML ID of the button element
  id: PropTypes.string,
  // Button color type
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "tertiary",
    "error",
    "warning",
    "success",
    "info",
    "primary-outline",
    "secondary-outline",
    "tertiary-outline",
    "error-outline",
    "warning-outline",
    "success-outline",
    "info-outline",
  ]),
  // Button sizes
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
  // True to disable the button
  disabled: PropTypes.bool,
};

Button.displayName = "Button";

/**
 * Displays a Button that links to a URL. The navigationClick handler is run
 * just before we link to the destination in the href prop.
 * <Button.Link href=/path/to/page>
 *   Go Here!
 * </Button.Link>
 */
const Link = ({
  href,
  navigationClick = null,
  id = null,
  type = "primary",
  size = "md",
  label = "",
  className = "",
  children,
}) => {
  const router = useRouter();

  const onClick = () => {
    if (navigationClick) {
      navigationClick();
    }
    router.push(href);
  };

  return (
    <Button
      onClick={onClick}
      id={id}
      type={type}
      size={size}
      label={label}
      className={className}
    >
      {children}
    </Button>
  );
};

Link.propTypes = {
  // Link that pressing the button will navigate to
  href: PropTypes.string.isRequired,
  // Called when the button is clicked
  navigationClick: PropTypes.func,
  // HTML ID of the button element
  id: PropTypes.string,
  // Accessible label of the button if the button text is not sufficient for screen readers
  label: PropTypes.string,
  // Button color type
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "tertiary",
    "error",
    "warning",
    "success",
    "info",
    "primary-outline",
    "secondary-outline",
    "tertiary-outline",
    "error-outline",
    "warning-outline",
    "success-outline",
    "info-outline",
  ]),
  // Button sizes
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
};

/**
 * Displays a circular icon button. Use similarly to <Button> but only one size is available.
 * <Button.Icon>
 *   <SomeIcon />
 * </Button.Icon>
 */
const Icon = ({
  onClick,
  type = "primary",
  id = null,
  size = "6",
  label,
  isDisabled = false,
  hasBorder = true,
  className = "",
  children,
}) => {
  // Add the Tailwind CSS classes for the SVG fill to the <svg> children of the button.
  const filledChildren = Children.map(children, (child) => {
    return cloneElement(child, {
      className: buttonFillTypeClasses[type],
    });
  });

  const borderClass = hasBorder ? "border" : "";

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className={`block h-${size} w-${size} rounded-full ${borderClass} p-1 ${buttonTypeClasses[type]} ${borderTypeClasses[type]} ${buttonFillTypeClasses[type]} ${className}`}
      aria-label={label}
      disabled={isDisabled}
    >
      {filledChildren}
    </button>
  );
};

Icon.propTypes = {
  // Called when the button is clicked
  onClick: PropTypes.func.isRequired,
  // HTML ID of the button element
  id: PropTypes.string,
  // Size of the icon, default "6"
  size: PropTypes.string,
  // Accessible label of the button for screen readers
  label: PropTypes.string.isRequired,
  // Button color type
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "tertiary",
    "error",
    "warning",
    "success",
    "info",
    "primary-outline",
    "secondary-outline",
    "tertiary-outline",
    "error-outline",
    "warning-outline",
    "success-outline",
    "info-outline",
  ]),
  // True to disable the button
  isDisabled: PropTypes.bool,
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
  // If Icon has a border or not
  hasBorder: PropTypes.bool,
};

/**
 * This is acts like a link like Button.Link but uses an icon like Button.Icon
 */
const LinkIcon = ({
  href,
  navigationClick = null,
  type = "primary",
  id = null,
  size = "6",
  className = "",
  label,
  isDisabled = false,
  children,
}) => {
  const router = useRouter();

  const onClick = () => {
    if (navigationClick) {
      navigationClick();
    }
    router.push(href);
  };

  return (
    <Button.Icon
      onClick={onClick}
      type={type}
      id={id}
      size={size}
      label={label}
      className={className}
      isDisabled={isDisabled}
    >
      {children}
    </Button.Icon>
  );
};

LinkIcon.propTypes = {
  // Link location that the page will navigate to when the button is clicked
  href: PropTypes.string,
  // Called when the button is clicked before going to the URL in href
  navigationClick: PropTypes.func,
  // Button color type
  type: PropTypes.PropTypes.oneOf([
    "primary",
    "secondary",
    "tertiary",
    "error",
    "warning",
    "success",
    "info",
    "primary-outline",
    "secondary-outline",
    "tertiary-outline",
    "error-outline",
    "warning-outline",
    "success-outline",
    "info-outline",
  ]),
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
  // HTML ID of the button element
  id: PropTypes.string,
  // Size of the icon, default "6"
  size: PropTypes.string,
  // Accessible label of the button for screen readers
  label: PropTypes.string.isRequired,
  // True to disable the button
  isDisabled: PropTypes.bool,
};

Button.Icon = Icon;
Button.Link = Link;
Button.LinkIcon = LinkIcon;
export default Button;
