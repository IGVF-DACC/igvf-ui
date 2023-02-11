// node_modules
import { XMarkIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { Button } from "./form-elements";

/**
 * Displays a standard close icon button in a circle with an X mark.
 */
export default function CloseButton({ onClick, label }) {
  return (
    <Button
      type="secondary"
      onClick={onClick}
      label={label}
      size="sm"
      hasIconCircleOnly
    >
      <XMarkIcon />
    </Button>
  );
}

CloseButton.propTypes = {
  // Called to close the modal on click
  onClick: PropTypes.func.isRequired,
  // Accessible label for the close button
  label: PropTypes.string.isRequired,
};
