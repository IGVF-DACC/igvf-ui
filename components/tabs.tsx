// node_modules
import { Tab } from "@headlessui/react";
import { Children, isValidElement, ReactNode } from "react";

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
  // Find all TabList components within the TabGroup's children.
  const tabListChildren = Children.toArray(children).filter(
    (child): child is React.ReactElement<{ children: ReactNode }> =>
      isValidElement(child) && child.type === TabList
  );

  // For each TabList, find all TabTitle components.
  const tabTitleComponents = tabListChildren.flatMap((tabList) =>
    Children.toArray(tabList.props.children)
  );

  // For each TabTitle component, extract its id if it's a string. If the id is missing or not a
  // string, ignore that TabTitle since we won't be able to map it to an index reliably.
  return tabTitleComponents.flatMap((tabTitle) => {
    if (!isValidElement(tabTitle) || tabTitle.type !== TabTitle) {
      return [];
    }

    return typeof tabTitle.props.id === "string" ? [tabTitle.props.id] : [];
  });
}

/**
 * Wraps the entire tab complex including all tabs and their associated panes. Optionally, pass
 * user clicks in tabs to the parent component.
 *
 * @param onChange - Optional callback function to invoke when the selected tab changes
 * @param defaultId - The id of the tab to select by default. First tab if not provided
 * @param className - Tailwind CSS classes to apply to the outermost element
 */
export function TabGroup({
  onChange,
  defaultId,
  className,
  children,
}: {
  onChange?: (id: string) => void;
  defaultId?: string;
  className?: string;
  children: ReactNode;
}) {
  const tabIds = getTabIdsWithinTabGroup(children);
  const defaultTabIndex = defaultId ? tabIds.indexOf(defaultId) : 0;

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
      defaultIndex={defaultTabIndex === -1 ? 0 : defaultTabIndex}
    >
      <div className={className}>{children}</div>
    </Tab.Group>
  );
}

/**
 * Wrap the `TabTitle` components within this component. By default, this component adds a
 * bottom border to the tabs that's the full width of the <TabGroup> component. You can override
 * this with the `className` prop.
 *
 * @param className - Tailwind CSS classes to apply to the wrapper around the tabs
 */
export function TabList({
  className = "border-b border-tab-group",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tab.List className={`flex items-stretch ${className}`}>
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
 *
 * @param label - Accessible label for this tab if the title isn't enough
 * @param isDisabled - True to disable this tab
 * @param className - Tailwind CSS classes to apply to each tab title; overrides the default
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
  children:
    | ReactNode
    | ((props: { selected: boolean; isDisabled: boolean }) => ReactNode);
}) {
  return (
    <Tab
      id={id}
      disabled={isDisabled}
      className={`flex items-stretch ${className}`}
      aria-label={label}
    >
      {({ selected }) => {
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
            {typeof children === "function"
              ? children({ selected, isDisabled })
              : children}
          </div>
        );
      }}
    </Tab>
  );
}

/**
 * Wraps all of the content areas for the tabs.
 *
 * @param className - Tailwind CSS classes to apply to the wrapper around all tab panes
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
 *
 * @param className - Tailwind CSS classes to apply to this tab pane; overrides the default
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
