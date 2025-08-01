// node_modules
import PropTypes from "prop-types";
import { useState } from "react";
// components
import { Button } from "./form-elements";

/**
 * This hook copies the given text to the clipboard. To trigger the copy action, call
 * `initiateCopy`, usually when the user clicks a button. The `isCopied` state is set to true for
 * two seconds after after you call `initiateCopy`. This lets you temporarily display an indicator
 * to the user that the copy was successful.
 * @param {string} target The text to copy to the clipboard.
 * @returns {object}
 * @returns {boolean} isCopied True if the user clicked the button within the last two seconds
 * @returns {function} initiateCopy Call when the user clicks the button to initiate the copy action
 */
export function useCopyAction(target) {
  // True if the user has clicked the copy button within the last two seconds
  const [isCopied, setCopied] = useState(false);

  /**
   * Copies the given text to the clipboard.
   */
  function initiateCopy() {
    navigator.clipboard.writeText(target).then(() => {
      // Temporarily display a checkmark to confirm to the user that the copy was successful. Once
      // tooltips are feature complete, might want to add a "Copied" tooltip along with the check
      // mark.
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  }

  return {
    // States
    isCopied,
    // Actions
    initiateCopy,
  };
}

/**
 * Displays a button to copy text to the clipboard. Supply a function as the child of this button
 * that takes an argument that gets set to true for two seconds after the user clicks the copy
 * button.
 */
export default function CopyButton({
  target,
  label = null,
  disabled = false,
  className = "",
  children,
}) {
  const { isCopied, initiateCopy } = useCopyAction(target);

  return (
    <Button
      onClick={initiateCopy}
      isDisabled={disabled}
      className={className}
      label={label}
    >
      {children(isCopied)}
    </Button>
  );
}

CopyButton.propTypes = {
  // The text to copy
  target: PropTypes.string.isRequired,
  // Accessible label for the button
  label: PropTypes.string,
  // True if the button should appear disabled
  disabled: PropTypes.bool,
  // Additional Tailwind CSS class names
  className: PropTypes.string,
};

/**
 * Same as the base `CopyButton` component, but it has a circular style to hold a single icon.
 * Supply a function as the child of this button that takes an argument that gets set to true for
 * two seconds after the user clicks the copy button.
 */
function Icon({
  target,
  label,
  size = "md",
  className = "cursor-pointer",
  children,
}) {
  const { isCopied, initiateCopy } = useCopyAction(target);

  return (
    <Button
      onClick={initiateCopy}
      className={className}
      label={label}
      size={size}
      hasIconOnly
    >
      {children(isCopied)}
    </Button>
  );
}

Icon.propTypes = {
  // The text to copy
  target: PropTypes.string.isRequired,
  // Accessible label for the button
  label: PropTypes.string.isRequired,
  // Size of the button
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  // Additional Tailwind CSS class names
  className: PropTypes.string,
};

CopyButton.Icon = Icon;
