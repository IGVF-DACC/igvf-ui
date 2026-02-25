// node_modules
import { MenuButton } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Render a button that triggers the opening and closing of the select menu. The button displays
 * the provided `children` and an icon showing that this is a dropdown menu.
 *
 * @param className - Additional class names to apply to the trigger button
 * @param onMouseEnter - Mouse enter handler for the trigger button
 * @param onMouseLeave - Mouse leave handler for the trigger button
 */
export function Trigger({
  className,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}) {
  return (
    <MenuButton
      className={twMerge(
        "border-select-menu-outline text-select-menu-item-label bg-select-menu flex h-8 cursor-pointer items-center gap-1 rounded-lg border pr-1 pl-2 text-sm font-semibold",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <ChevronUpDownIcon
        data-testid="select-menu-trigger-icon"
        className="text-select-menu-signal h-4 w-4"
        aria-hidden="true"
      />
    </MenuButton>
  );
}
