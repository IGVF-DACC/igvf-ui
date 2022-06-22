// node_modules
import PropTypes from "prop-types"

/**
 * Display a standard checkbox. Wrap this component around the label of the checkbox.
 */
const Checkbox = ({ checked, onChange, className = "", children }) => {
  return (
    <label className={className}>
      <input
        className="mr-1"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {children}
    </label>
  )
}

Checkbox.propTypes = {
  // True if the checkbox is checked
  checked: PropTypes.bool.isRequired,
  // Called when the checkbox is checked or unchecked
  onChange: PropTypes.func.isRequired,
  // Additional Tailwind CSS class names to apply to the checkbox
  className: PropTypes.string,
}

export default Checkbox
