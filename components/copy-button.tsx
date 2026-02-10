// node_modules
import { useState, type ReactNode } from "react";
// components
import { Button } from "./form-elements";

/**
 * Information and actions related to copying text to the clipboard with the `useCopyAction` hook.
 *
 * @property isCopied - True if the user clicked the button within the last two seconds
 * @property initiateCopy - Call when the user clicks the button to initiate the copy action
 */
type CopyActions = {
  isCopied: boolean;
  initiateCopy: () => void;
};

/**
 * This hook copies the given text to the clipboard. To trigger the copy action, call
 * `initiateCopy`, usually when the user clicks a button. The `isCopied` state is set to true for
 * two seconds after after you call `initiateCopy`. This lets you temporarily display an indicator
 * to the user that the copy was successful.
 *
 * @param target - The text to copy to the clipboard.
 * @returns Copy actions associated with a copy button
 */
export function useCopyAction(target: string): CopyActions {
  // True if the user has clicked the copy button within the last two seconds
  const [isCopied, setCopied] = useState(false);

  /**
   * Copies the given text to the clipboard.
   */
  function initiateCopy() {
    navigator.clipboard
      .writeText(target)
      .then(() => {
        // Temporarily display a checkmark to confirm to the user that the copy was successful. Once
        // tooltips are feature complete, might want to add a "Copied" tooltip along with the check
        // mark.
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Clipboard write failed:", error);
      });
  }

  return {
    isCopied,
    initiateCopy,
  };
}

/**
 * Displays a button to copy text to the clipboard. Supply a function as the child of this button
 * that takes an argument that gets set to true for two seconds after the user clicks the copy
 * button.
 *
 * @param target - The text to copy to the clipboard
 * @param label - Accessible label for the button
 * @param disabled - True if the button should appear disabled
 * @param type - Type of the button: "primary", "secondary", "warning", or "selected"
 * @param size - Size of the button: "sm", "md", or "lg"
 * @param className - Additional Tailwind CSS class names
 */
export function CopyButton({
  target,
  label = null,
  disabled = false,
  type,
  size,
  className = "",
  children,
}: {
  target: string;
  label?: string | null;
  disabled?: boolean;
  type?: "primary" | "secondary" | "warning" | "selected";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: (isCopied: boolean) => ReactNode;
}) {
  const { isCopied, initiateCopy } = useCopyAction(target);

  return (
    <Button
      onClick={initiateCopy}
      label={label}
      isDisabled={disabled}
      type={type}
      size={size}
      className={className}
    >
      {children(isCopied)}
    </Button>
  );
}

/**
 * Same as the base `CopyButton` component, but it has a circular style to hold a single icon.
 * Supply a function as the child of this button that takes an argument that gets set to true for
 * two seconds after the user clicks the copy button.
 *
 * @param target - The text to copy to the clipboard
 * @param label - Accessible label for the button
 * @param type - Type of the button: "primary", "secondary", "warning", or "selected"
 * @param size - Size of the button: "sm", "md", or "lg"
 * @param className - Additional Tailwind CSS class names
 */
function Icon({
  target,
  label,
  type,
  size,
  className,
  children,
}: {
  target: string;
  label: string;
  type?: "primary" | "secondary" | "warning" | "selected";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: (isCopied: boolean) => ReactNode;
}) {
  const { isCopied, initiateCopy } = useCopyAction(target);

  return (
    <Button
      onClick={initiateCopy}
      className={className}
      label={label}
      type={type}
      size={size}
      hasIconOnly
    >
      {children(isCopied)}
    </Button>
  );
}

CopyButton.Icon = Icon;
