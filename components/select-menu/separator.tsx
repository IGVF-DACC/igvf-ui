// node_modules
import { MenuSeparator } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

/**
 * Render a horizontal separator line to divide groups of items in the select menu. Use
 * `<Menu.Separator>` as a peer to `<Menu.Item>`. Additional class names can be passed in
 * `className` to further customize the appearance of the separator.
 *
 * @param className - Additional class names to apply to the separator
 */
export function Separator({ className }: { className?: string }) {
  return (
    <MenuSeparator
      className={twMerge("bg-select-menu-separator my-1 h-px", className)}
    />
  );
}
