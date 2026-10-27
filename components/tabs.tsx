// node_modules
import { Tab } from "@headlessui/react";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";
// root
import type { SynchronousReactNode } from "../globals";

type TabTitleRenderProps = {
  selected: boolean;
  isDisabled: boolean;
};

/**
 * Represents the children of a TabTitle component, which can either be a synchronous React node or
 * a function that returns one.
 */
type TabTitleChildren =
  | SynchronousReactNode
  | ((renderProps: TabTitleRenderProps) => SynchronousReactNode);

/**
 * This module lets you place tabs that switch between different content in one area of a page. See
 * the documentation at [./docs/tabs.md](./docs/tabs.md).
 */

/**
 * Returns an array of the ids of the TabTitle components within the TabList components within a
 * TabGroup component. The headlessui tab component relies on tab indices, which has the issue of
 * these indices changing if you change the order of the tabs. By using an id instead, you can
 * reorder tabs without changing their ids. The array this function returns helps map the index to
 * the id.
 *
 * @param children - Direct children of the TabGroup component including TabList
 * @returns Array of the ids of the TabTitle components within the TabGroup
 */
function getTabIdsWithinTabGroup(children: ReactNode): string[] {
  // Get all TabList components within the TabGroup.
  const tabLists = Children.toArray(children).filter(
    (
      child
    ): child is ReactElement<{
      children?: ReactNode;
    }> => isValidElement(child) && child.type === TabList
  );

  return tabLists
    .flatMap((tabList) => Children.toArray(tabList.props.children))
    .filter((child): child is ReactElement<{ id?: string }> =>
      isValidElement(child)
    )
    .map((tabTitle) => tabTitle.props.id ?? "");
}

/**
 * Wraps the entire tab complex including all tabs and their associated panes. Optionally, pass user
 * clicks in tabs to the parent component.
 *
 * @param onChange - Optional callback function invoked when the selected tab changes, receiving the tab's id
 * @param defaultId - ID of the tab to select by default
 * @param selectedId - ID of the selected tab when controlling the group externally
 * @param className - Tailwind CSS classes to apply to the outermost element
 * @param children - Direct children of the TabGroup component including TabList
 */
export function TabGroup({
  onChange = null,
  defaultId = "",
  selectedId,
  className = null,
  children,
}: {
  onChange?: (id: string) => void;
  defaultId?: string;
  selectedId?: string;
  className?: string | null;
  children: ReactNode;
}) {
  const tabIds = getTabIdsWithinTabGroup(children);
  const defaultTabIndex = defaultId ? tabIds.indexOf(defaultId) : 0;
  const selectedTabIndex =
    selectedId !== undefined ? tabIds.indexOf(selectedId) : null;

  // Convert the tab index from headlessui to the corresponding tab id, then invoke the parent's
  // onChange callback with the id, if provided.
  function onChangeWithId(index: number) {
    if (onChange) {
      onChange(tabIds[index]);
    }
  }

  return (
    <Tab.Group
      onChange={onChangeWithId}
      {...(selectedTabIndex !== null
        ? { selectedIndex: selectedTabIndex === -1 ? 0 : selectedTabIndex }
        : { defaultIndex: defaultTabIndex === -1 ? 0 : defaultTabIndex })}
    >
      <div className={className}>{children}</div>
    </Tab.Group>
  );
}

/**
 * Wrap the `TabTitle` components within this component. By default, this component adds a bottom
 * border to the tabs that's the full width of the <TabGroup> component. You can override this with
 * the `className` prop.
 *
 * @param className - Tailwind CSS classes to apply to the tab list wrapper
 */
export function TabList({
  className = "border-b border-tab-group",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tab.List className={twMerge(`flex items-stretch`, className)}>
      {children}
    </Tab.List>
  );
}

/**
 * Implements a single tab. Wrap each tab's title tab title within this component. You can use this
 * to wrap a simple string, a React component, or a function that returns a React component. In the
 * last case, the function receives a `selected` argument equal to `true` only for the selected
 * tab. This lets you render different content for the selected tab. The function also receives the
 * `isDisabled` argument for tabs the parent component has disabled. Disabled tabs do not react to
 * mouse clicks nor hovers.
 */
export function TabTitle({
  id,
  label,
  isDisabled = false,
  className = "items-center font-semibold",
  children,
}: {
  id?: string;
  label?: string;
  isDisabled?: boolean;
  className?: string;
  children: TabTitleChildren;
}) {
  // Clone element children and add TabTitle's id prop to each clone's props.
  function addIdToChildren(
    renderedChildren: SynchronousReactNode
  ): ReactNode[] {
    return (
      Children.map(renderedChildren, (child): SynchronousReactNode => {
        return isValidElement<{ id?: string | null }>(child)
          ? cloneElement(child, { id })
          : child;
      }) ?? []
    );
  }

  return (
    <Tab
      disabled={isDisabled}
      className={`flex cursor-pointer items-stretch ${className}`}
      aria-label={label}
    >
      {({ selected }) => {
        const renderedChildren =
          typeof children === "function"
            ? children({ selected, isDisabled })
            : children;

        return (
          <div
            className={`flex border-b-4 px-5 pt-2 pb-1.5 ${
              selected ? "border-tab-selected text-tab-title-selected" : ""
            } ${
              isDisabled ? "border-tab-disabled text-tab-title-disabled" : ""
            } ${
              !selected && !isDisabled
                ? "border-tab-unselected text-tab-title-unselected hover:border-tab-hover hover:text-tab-title-hover"
                : ""
            }`}
          >
            {addIdToChildren(renderedChildren)}
          </div>
        );
      }}
    </Tab>
  );
}

/**
 * Wraps all of the content areas for the tabs.
 */
export function TabPanes({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <Tab.Panels className={className}>{children}</Tab.Panels>;
}

/**
 * Wraps a single tab content area for a single tab.
 */
export function TabPane({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <Tab.Panel className={className}>{children}</Tab.Panel>;
}
