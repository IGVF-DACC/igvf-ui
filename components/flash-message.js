/**
 * Displays a dismissable message after an action. This often gets used to display error messages
 * after a failed network operation, but you can also display success and informational messages.
 */

// node_modules
import PropTypes from "prop-types";
// components
import CloseButton from "./close-button";

const classes = {
  error: {
    frame: "border-red-500 bg-red-100 dark:bg-red-900",
    close: "bg-red-500 dark:bg-rose-600",
  },
  success: {
    frame: "border-green-500 bg-green-100 dark:bg-green-900",
    close: "bg-green-500 dark:bg-green-600",
  },
  info: {
    frame: "border-blue-500 bg-blue-100 dark:bg-blue-900",
    close: "bg-blue-400 dark:bg-blue-600",
  },
};

const FlashMessage = ({ message, type = "error", onClose }) => {
  return (
    <div
      className={`my-2 flex items-center rounded-md border p-2 ${classes[type].frame}`}
    >
      <div className="grow text-gray-600 dark:text-gray-300">{message}</div>
      <div className="ml-2 shrink basis-5">
        <CloseButton
          onClick={onClose}
          label="Close message"
          className={`[&>svg]:fill-white ${classes[type].close}`}
        />
      </div>
    </div>
  );
};

FlashMessage.propTypes = {
  // Error message to display
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  // Type of message to display; affects the colors of the message
  type: PropTypes.oneOf(["error", "success", "info"]),
  // Called when the user closes the modal
  onClose: PropTypes.func.isRequired,
};

export default FlashMessage;
