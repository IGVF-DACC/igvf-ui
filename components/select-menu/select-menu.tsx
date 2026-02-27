// node_modules
import { Menu } from "@headlessui/react";
import { ReactElement, ReactNode } from "react";

/**
 * The render prop argument passed to SelectMenu's children function. Mirrors headlessui's
 * MenuRenderPropArg, which cannot be reliably extracted via ComponentProps because Menu is a
 * generic component and ComponentProps only returns the default-tag signature.
 */
type MenuRenderPropArg = {
  open: boolean;
  close: () => void;
};

/**
 * Wrap your select menu with `<SelectMenu>` to provide the context for all its subcomponents. The
 * `children` of `SelectMenu` should include a `<SelectMenu.Trigger>` component that defines the
 * element that opens the menu when clicked, and a `<SelectMenu.Items>` component that contains the
 * menu items to be shown when the menu is open.
 *
 * @param className - Additional class names to apply to the select menu container
 */
export function SelectMenu({
  className,
  children,
}: {
  className?: string;
  children: ReactNode | ((props: MenuRenderPropArg) => ReactElement);
}) {
  return (
    <Menu as="div" className={className}>
      {children}
    </Menu>
  );
}
