// node_modules
import PropTypes from "prop-types";
// components
import Icon from "../icon";

/**
 * Displays the label for a form element.
 */
export default function FormLabel({
  htmlFor = "",
  isRequired = false,
  className = "",
  children,
}) {
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
}

FormLabel.propTypes = {
  // The id of the form element this label is for
  htmlFor: PropTypes.string,
  // True if the label is required
  isRequired: PropTypes.bool,
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};
