// node_modules
import { XMarkIcon } from "@heroicons/react/20/solid";
import { twMerge } from "tailwind-merge";
// components
import { Button } from "./form-elements";

/**
 * Displays a standard close icon button in a circle with an X mark.
 *
 * @param onClick - Function to call when the button is clicked
 * @param label - Accessible label for the button
 * @param className - Optional additional class names to apply to the button
 */
export default function CloseButton({
  onClick,
  label,
  className = "",
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <Button
      type="secondary"
      onClick={onClick}
      label={label}
      size="sm"
      className={twMerge("shrink-0", className)}
      hasIconCircleOnly
    >
      <XMarkIcon />
    </Button>
  );
}
