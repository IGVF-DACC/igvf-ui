import { ReactNode } from "react";

/**
 * Drop-in replacement for headlessui's `MenuItems` that skips the `anchor` prop so
 * @floating-ui/react (bundled inside headlessui) never starts its requestAnimationFrame
 * positioning loop. Use it as a partial mock in any test that renders `<Items>`:
 *
 *   jest.mock("@headlessui/react", () => ({
 *     ...jest.requireActual("@headlessui/react"),
 *     MenuItems: jest.requireActual("./mock-headlessui-menu-items").MenuItems,
 *   }));
 */
export function MenuItems({
  children,
  className,
  onMouseEnter,
  onMouseLeave,
}: {
  children: ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  // `anchor` intentionally omitted — ignoring it is the whole point of this mock.
}) {
  return (
    <div
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
