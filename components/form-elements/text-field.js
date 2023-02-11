/**
 * This module displays form elements with a site-wide standard styling.
 */

// node_modules
import PropTypes from "prop-types";
// components/form-elements
import FormLabel from "./form-label";
// lib
import { UC } from "../../lib/constants";

const sizeClasses = {
  sm: "text-xs px-1 form-element-height-sm",
  md: "text-sm px-1.5 form-element-height-md",
  lg: "text-lg px-2 form-element-height-lg",
};

const labelSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * Displays an input text field. This uses the React controlled-input method, so the current
 * edited value gets passed in the `value` property.
 */
export default function TextField({
  label = "",
  name,
  value,
  message = "",
  size = "md",
  onChange,
  onBlur = null,
  onFocus = null,
  className = null,
  isRequired = false,
  isDisabled = false,
  isSpellCheckDisabled = false,
  placeholder = null,
}) {
  return (
    <div data-testid="form-text-field" className={className}>
      {label && (
        <FormLabel
          htmlFor={name}
          className={labelSizeClasses[size]}
          isRequired={isRequired}
        >
          {label}
        </FormLabel>
      )}
      <input
        className={`block w-full rounded border border-form-element bg-form-element text-form-element disabled:border-form-element-disabled disabled:text-form-element-disabled ${sizeClasses[size]}`}
        name={name}
        id={name}
        value={value}
        placeholder={placeholder}
        spellCheck={isSpellCheckDisabled ? "false" : "true"}
        disabled={isDisabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <div className="mt-1 text-xs font-bold uppercase text-red-500">
        {message || UC.nbsp}
      </div>
    </div>
  );
}

TextField.propTypes = {
  // Label to display above the text field
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]),
  // Name of the text field
  name: PropTypes.string.isRequired,
  // Value of the text field
  value: PropTypes.string.isRequired,
  // Message to display below the field
  message: PropTypes.string,
  // Size of the text field
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // Called when the text field value changes
  onChange: PropTypes.func.isRequired,
  // Called when the text field loses focus
  onBlur: PropTypes.func,
  // Called when the text field gains focus
  onFocus: PropTypes.func,
  // Tailwind CSS classes
  className: PropTypes.string,
  // True if the text field is required
  isRequired: PropTypes.bool,
  // True if the text field is disabled
  isDisabled: PropTypes.bool,
  // True if the text field should have spell checking disabled
  isSpellCheckDisabled: PropTypes.bool,
  // Placeholder text to display in the text field
  placeholder: PropTypes.string,
};
