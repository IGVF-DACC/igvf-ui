// node_modules
import PropTypes from "prop-types";

/**
 * Display a standard checkbox. Wrap this component around the label of the checkbox.
 */
export default function Checkbox({
  checked,
  name,
  onChange,
  className = "",
  children,
}) {
  return (
    <label data-testid="checkbox-label" className={className}>
      <input
        className="mr-1"
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      {children}
    </label>
  );
}

Checkbox.propTypes = {
  // True if the checkbox is checked
  checked: PropTypes.bool.isRequired,
  // HTML name attribute of the checkbox
  name: PropTypes.string.isRequired,
  // Called when the checkbox is checked or unchecked
  onChange: PropTypes.func.isRequired,
  // Additional Tailwind CSS class names to apply to the checkbox
  className: PropTypes.string,
};
