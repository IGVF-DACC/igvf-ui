/**
 * Standard button types so that all buttons on the site have the same look and feel.
 */

// node_modules
import PropTypes from "prop-types"
import { Children, cloneElement } from "react"

/**
 * Background colors for each of the button types.
 */
const buttonTypeClasses = {
  primary: "bg-button-primary",
  secondary: "bg-button-secondary",
  success: "bg-button-success",
  alert: "bg-button-alert",
  warning: "bg-button-warning",
  info: "bg-button-info",
}

/**
 * Border colors for each of the button types.
 */
const borderTypeClasses = {
  primary: "border-button-primary",
  secondary: "border-button-secondary",
  success: "border-button-success",
  alert: "border-button-alert",
  warning: "border-button-warning",
  info: "border-button-info",
}

/**
 * Text colors for each of the button types.
 */
const buttonTextTypeClasses = {
  primary: "text-button-primary",
  secondary: "text-button-secondary",
  success: "text-button-success",
  alert: "text-button-alert",
  warning: "text-button-warning",
  info: "text-button-info",
}

/**
 * SVG fill colors for each of the button types.
 */
const buttonFillTypeClasses = {
  primary: "fill-button-primary",
  secondary: "fill-button-secondary",
  success: "fill-button-success",
  alert: "fill-button-alert",
  warning: "fill-button-warning",
  info: "fill-button-info",
}

/**
 * Tailwind CSS classes for each of the button sizes.
 */
const buttonSizeClasses = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1 text-sm",
  lg: "px-6 py-2 text-base",
}

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
  type = "primary",
  size = "md",
  label = "",
  className = "",
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block rounded border font-semibold ${buttonSizeClasses[size]} ${buttonTypeClasses[type]} ${borderTypeClasses[type]} ${buttonTextTypeClasses[type]} ${className}`}
      aria-label={label}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  // Called when the button is clicked
  onClick: PropTypes.func.isRequired,
  // Accessible label of the button if the button text is not sufficient for screen readers
  label: PropTypes.string,
  // Button color type
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "alert",
    "warning",
    "info",
  ]),
  // Button sizes
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
}

/**
 * Displays a circular icon button. Use similarly to <Button> but only one size is available.
 * <Button.Icon>
 *   <SomeIcon />
 * </Button.Icon>
 */
const Icon = ({
  onClick,
  type = "primary",
  label,
  className = "",
  children,
}) => {
  // Add the Tailwind CSS classes for the SVG fill to the <svg> children of the button.
  const filledChildren = Children.map(children, (child) => {
    return cloneElement(child, {
      className: buttonFillTypeClasses[type],
    })
  })

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block h-6 w-6 rounded-full border p-1 ${buttonTypeClasses[type]} ${borderTypeClasses[type]} ${className}`}
      aria-label={label}
    >
      {filledChildren}
    </button>
  )
}

Icon.propTypes = {
  // Called when the button is clicked
  onClick: PropTypes.func.isRequired,
  // Accessible label of the button for screen readers
  label: PropTypes.string.isRequired,
  // Button color type
  type: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "alert",
    "warning",
    "info",
  ]),
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
}

Button.Icon = Icon
export default Button
