// node_modules
import PropTypes from "prop-types";

/**
 * Display a standard radio button. Wrap this component around the label of the radio button.
 */
export default function RadioButton({
  checked,
  name,
  onChange,
  className = "",
  children,
}) {
  return (
    <label data-testid="radio-button-label" className={`flex ${className}`}>
      <input
        className="mr-1"
        type="radio"
        aria-label={name}
        checked={checked}
        onChange={onChange}
      />
      {children}
    </label>
  );
}

RadioButton.propTypes = {
  // True if the radio button is checked
  checked: PropTypes.bool.isRequired,
  // HTML name attribute of the radio button
  name: PropTypes.string.isRequired,
  // Called when the radio button is checked or unchecked
  onChange: PropTypes.func.isRequired,
  // Additional Tailwind CSS class names to apply to the radio button
  className: PropTypes.string,
};
