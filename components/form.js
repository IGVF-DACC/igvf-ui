/**
 * This module displays form elements with a site-wide standard styling.
 */

// node_modules
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import Icon from "./icon";
// lib
import { UC } from "../lib/constants";

/**
 * Displays the label for a form element.
 */
export const FormLabel = ({
  htmlFor = "",
  isRequired = false,
  className = "",
  children,
}) => {
  return (
    <label
      data-testid="form-label"
      htmlFor={htmlFor}
      className={`${className} flex items-center font-semibold text-data-label`}
    >
      {children}
      {isRequired && <Icon.Splat className="ml-1 h-2.5 w-2.5 fill-red-500" />}
    </label>
  );
};

FormLabel.propTypes = {
  // The id of the form element this label is for
  htmlFor: PropTypes.string,
  // True if the label is required
  isRequired: PropTypes.bool,
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Displays a <select> dropdown. It replaces the default browser styling so that <select> elements
 * in all browsers look the same.
 */
export const Select = ({
  label = "",
  name,
  value,
  onChange,
  onBlur = null,
  onFocus = null,
  className = null,
  children,
}) => {
  return (
    <div data-testid="form-select" className={className}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <div className="relative flex items-center">
        <select
          className="block w-full appearance-none rounded border border-data-border bg-white py-2 px-1 pr-8 text-sm leading-tight dark:bg-black"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute top-0 right-2 bottom-0 my-auto h-5 w-5">
          <ChevronDownIcon className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};

Select.propTypes = {
  // Label to display for the select element
  label: PropTypes.string,
  // Name of the select element
  name: PropTypes.string.isRequired,
  // Value of the select element
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  // Function to call when the select element is changed
  onChange: PropTypes.func.isRequired,
  // Called when the text field loses focus
  onBlur: PropTypes.func,
  // Called when the text field gains focus
  onFocus: PropTypes.func,
  // Tailwind CSS classes to apply to the select element
  className: PropTypes.string,
};

/**
 * Displays an input text field. This uses the React controlled input method, so the current
 * edited value gets passed in the `value` property.
 */
export const TextField = ({
  label = "",
  name,
  value,
  message = "",
  onChange,
  onBlur = null,
  onFocus = null,
  className = null,
  isRequired = false,
  isDisabled = false,
  isSpellCheckDisabled = false,
  placeholder = null,
}) => {
  return (
    <div data-testid="form-text-field" className={className || "my-2"}>
      {label && (
        <FormLabel htmlFor={name} isRequired={isRequired}>
          {label}
        </FormLabel>
      )}
      <input
        className="block w-full rounded border border-data-border bg-data-background p-2 text-sm"
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
};

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
