// node_modules
import { MenuItem } from "@headlessui/react";
import {
  ComponentProps,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";

/**
 * Derive an object type that maps each MenuItem prop name to its TypeScript type, so individual
 * prop types can be extracted by name below.
 */
type MenuItemProps = ComponentProps<typeof MenuItem>;

/**
 * Get the type of the `children` prop of MenuItem. This will be used to derive the children type
 * of the `Item` component defined below.
 */
type MenuItemChildren = MenuItemProps["children"];

/**
 * Extract only the function (render prop) type(s) from the union of possible MenuItem children
 * types.
 */
type MenuItemRenderProp = Extract<
  MenuItemChildren,
  (...args: unknown[]) => unknown
>;

/**
 * Get the type of the first argument of the render prop function. This is the type of the props
 * object passed to the render prop function of `Item`.
 */
type MenuItemRenderPropArg = Parameters<MenuItemRenderProp>[0];

/**
 * Shared class name between link items and button items, merged with any additional class names
 * passed via the `className` prop of `Item`.
 */
const itemClassName =
  "block w-full cursor-pointer px-3 py-1 text-left bg-select-menu-item text-select-menu-item-label data-focus:bg-select-menu-item-hover data-focus:text-select-menu-item-label-hover";

/**
 * Props in common between link items and button items.
 */
type BaseProps = {
  className?: string;
  children: ReactNode | ((props: MenuItemRenderPropArg) => ReactElement);
};

/**
 * Props for link items, which render as `<a>` elements.
 */
type LinkProps = {
  href: string;
  target?: string;
  rel?: string;
  onClick?: never;
};

/**
 * Props for button items, which render as `<button>` elements.
 */
type ButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  href?: never;
  target?: never;
  rel?: never;
};

/**
 * Wrap menu items with `<Menu.Item>` to have them appear in a standard form as items in the select
 * menu. If the `children` prop is a function, it will be treated as a render prop and called with
 * the props from `MenuItem` containing the state of the menu item (e.g. whether it is focused).
 * Otherwise, `children` will be rendered as-is. Hover over `MenuItemRenderPropArg` to see the
 * available state properties that the `children` render prop function receives.
 *
 * Provide `href` to render the item as an `<a>` element (e.g. for external links), in which case
 * `target` and `rel` can also be provided. Omit `href` to render as a `<button>` with an `onClick`.
 *
 * @param href - URL to navigate to when the item is clicked; renders item as an `<a>` element
 * @param target - `target` attribute for the `<a>` element (e.g. `"_blank"`)
 * @param rel - `rel` attribute for the `<a>` element (e.g. `"noreferrer"`)
 * @param onClick - Click handler for the menu item when rendered as a `<button>`
 * @param className - Additional class names to apply to the menu item
 */
export function Item(props: BaseProps & (LinkProps | ButtonProps)) {
  const { className, href, target, rel, onClick, children } = props;

  if (href) {
    return (
      <MenuItem
        as="a"
        href={href}
        target={target}
        rel={rel}
        className={twMerge(itemClassName, className)}
      >
        {children}
      </MenuItem>
    );
  }

  return (
    <MenuItem
      as="button"
      type="button"
      className={twMerge(itemClassName, className)}
      onClick={onClick}
    >
      {children}
    </MenuItem>
  );
}
