// node_modules
import PropTypes from "prop-types";
// components
import useLongClick from "./long-click";

/**
 * Display a standard checkbox. Wrap this component around the label of the checkbox. You can
 * optionally handle long clicks in the checkbox by supplying the `onLongChange` callback.
 */
export default function Checkbox({
  id,
  checked,
  name,
  onClick,
  onLongClick = null,
  className = "",
  children,
}) {
  // If no long click handler is supplied, use the normal click handler to handle long clicks.
  const longClickHandler = onLongClick || onClick;
  useLongClick(id, onClick, longClickHandler);

  return (
    <label
      id={id}
      data-testid="checkbox-label"
      className={`flex cursor-pointer ${className}`}
    >
      <input
        className="mr-1 cursor-pointer"
        type="checkbox"
        aria-label={name}
        checked={checked}
        onChange={() => {}}
      />
      {children}
    </label>
  );
}

Checkbox.propTypes = {
  // Unique ID for the checkbox
  id: PropTypes.string.isRequired,
  // True if the checkbox is checked
  checked: PropTypes.bool.isRequired,
  // HTML name attribute of the checkbox
  name: PropTypes.string.isRequired,
  // Called when the checkbox is checked or unchecked
  onClick: PropTypes.func.isRequired,
  // Called when the checkbox is long-pressed
  onLongClick: PropTypes.func,
  // Additional Tailwind CSS class names to apply to the checkbox
  className: PropTypes.string,
};
