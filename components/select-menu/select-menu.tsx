// node_modules
import { Menu } from "@headlessui/react";
import { ComponentProps, ReactElement, ReactNode } from "react";

/**
 * Derive an object type that maps each MenuItem prop name to its TypeScript type, so individual
 * prop types can be extracted by name below.
 */
type MenuProps = ComponentProps<typeof Menu>;

/**
 * Get the type of the `children` prop of MenuItem. This will be used to derive the children type
 * of the `Item` component defined below.
 */
type MenuChildren = MenuProps["children"];

/**
 * Extract only the function (render prop) type(s) from the union of possible MenuItem children
 * types. This could be a single function type or a union of function types.
 */
type MenuRenderProp = Extract<MenuChildren, (...args: unknown[]) => unknown>;

/**
 * Get the type of the first argument of the render prop function. This is the type of the props
 * object passed to the render prop function of `Item`.
 */
type MenuRenderPropArg = Parameters<MenuRenderProp>[0];

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
