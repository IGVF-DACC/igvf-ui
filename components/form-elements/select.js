// node_modules
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components/form-elements
import FormLabel from "./form-label";

/**
 * Tailwind CSS classes for each of the select sizes.
 */
const selectSizeClasses = {
  sm: "text-xs h-6",
  md: "text-sm h-8 leading-[180%]",
  lg: "text-base h-10 leading-[220%]",
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
          className={`border-form-element bg-form-element text-form-element disabled:border-form-element-disabled disabled:text-form-element-disabled block w-full appearance-none rounded-sm border py-0 pr-5 pl-1 font-medium ${selectSizeClasses[size]}`}
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
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 my-auto h-5 w-5">
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
