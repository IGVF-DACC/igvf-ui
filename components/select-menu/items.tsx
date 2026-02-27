// node_modules
import { MenuItems } from "@headlessui/react";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Wrap the list of `<Menu.Item>` components with `<Menu.Items>` to have them rendered in a
 * floating panel when the menu is open. The `justify` prop controls the alignment of the panel
 * relative to the trigger element -- `left` aligns the left edge of the panel with the left edge
 * of the trigger, while `right` aligns the right edge of the panel with the right edge of the
 * trigger.
 *
 * @param justify - Alignment "left" | "right"
 * @param onMouseEnter - Optional mouse enter handler for the menu items root element
 * @param onMouseLeave - Optional mouse leave handler for the menu items root element
 * @param className - Additional class names to apply to the menu items container
 */
export function Items({
  justify = "left",
  onMouseEnter,
  onMouseLeave,
  className,
  children,
}: {
  justify?: "left" | "right";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <MenuItems
      anchor={justify === "right" ? "bottom end" : "bottom start"}
      className={twMerge(
        "border-select-menu-root-outline bg-select-menu-root z-20 mt-1 rounded-lg border text-sm font-semibold shadow-lg",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </MenuItems>
  );
}
