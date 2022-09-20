// node_modules
import { XMarkIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import Button from "./button";

/**
 * Displays a standard close icon button in a circle with an X mark.
 */
const CloseButton = ({ onClick, label, className = "" }) => {
  return (
    <Button.Icon
      type="info-outline"
      onClick={onClick}
      label={label}
      className={`block h-6 w-6 rounded-full ${className}`}
    >
      <XMarkIcon />
    </Button.Icon>
  );
};

CloseButton.propTypes = {
  // Called to close the modal on click
  onClick: PropTypes.func.isRequired,
  // Accessible label for the close button
  label: PropTypes.string.isRequired,
  // Tailwind CSS classes to apply colors or other changes to the close button
  className: PropTypes.string,
};

export default CloseButton;
