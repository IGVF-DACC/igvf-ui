// node_modules
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components/form-elements
import FormLabel from "./form-label";

/**
 * Tailwind CSS classes for each of the select sizes.
 */
const selectSizeClasses = {
  sm: "text-xs form-element-height-sm",
  md: "text-sm form-element-height-md leading-[180%]",
  lg: "text-base form-element-height-lg leading-[220%]",
};

const labelSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * Displays a <select> dropdown. It replaces the default browser styling so that <select> elements
 * in all browsers look the same. It displays an absolutely positioned icon in the right side of
 * the <select> element.
 */
export default function Select({
  label = "",
  name,
  value,
  size = "md",
  isDisabled = false,
  onChange,
  onBlur = null,
  onFocus = null,
  className = "",
  children,
}) {
  return (
    <div data-testid="form-select" className={className}>
      {label && (
        <FormLabel htmlFor={name} className={labelSizeClasses[size]}>
          {label}
        </FormLabel>
      )}
      <div className="relative">
        <select
          className={`block w-full appearance-none rounded border border-form-element bg-form-element py-0 pl-1 pr-5 font-medium text-form-element disabled:border-form-element-disabled disabled:text-form-element-disabled ${selectSizeClasses[size]}`}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={isDisabled}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 my-auto h-5 w-5">
          <ChevronDownIcon
            className={`h-full w-full ${
              isDisabled ? "fill-form-element-disabled" : "fill-form-element"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

Select.propTypes = {
  // Label to display outside the <select> element
  label: PropTypes.string,
  // Name of the select element; used as element id
  name: PropTypes.string.isRequired,
  // Value of the select element
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  // Size of the select element
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // True if select element is disabled
  isDisabled: PropTypes.bool,
  // Function to call when the select element is changed
  onChange: PropTypes.func.isRequired,
  // Called when the text field loses focus
  onBlur: PropTypes.func,
  // Called when the text field gains focus
  onFocus: PropTypes.func,
  // Tailwind CSS classes to apply to the select element
  className: PropTypes.string,
};
