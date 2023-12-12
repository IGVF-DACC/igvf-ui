// node_modules
import { Tab } from "@headlessui/react";
import PropTypes from "prop-types";
import { Children } from "react";

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
 * @param {React.node} children Direct children of the TabGroup component including TabList
 * @returns {string[]} An array of the ids of the TabTitle components within the TabGroup
 */
function getTabIdsWithinTabGroup(children) {
  const tabTitleComponents = Children.toArray(children)
    .filter((child) => child.type === TabList)
    .map((tabList) => Children.toArray(tabList.props.children))
    .flat()
    .filter((child) => child.type === TabTitle);
  return tabTitleComponents.map((tabTitle) => tabTitle.props.id);
}

/**
 * Wraps the entire tab complex including all tabs and their associated panes. Optionally, pass
 * user clicks in tabs to the parent component.
 */
export function TabGroup({ onChange = null, className = null, children }) {
  const tabIds = getTabIdsWithinTabGroup(children);

  // Convert the tab index from headlessui to the corresponding tab id, then invoke the parent's
  // onChange callback with the id, if provided.
  function onChangeWithId(index) {
    if (onChange) {
      onChange(tabIds[index]);
    }
  }

  return (
    <Tab.Group onChange={onChangeWithId}>
      <div className={className}>{children}</div>
    </Tab.Group>
  );
}

TabGroup.propTypes = {
  // Optional callback function to invoke when the selected tab changes
  onChange: PropTypes.func,
  // Tailwind CSS classes to apply to the outermost element
  className: PropTypes.string,
};

/**
 * Wrap the `TabTitle` components within this component. By default, this component adds a
 * bottom border to the tabs that's the full width of the <TabGroup> component. You can override
 * this with the `className` prop.
 */
export function TabList({ className = "border-b border-tab-group", children }) {
  return (
    <Tab.List className={`flex items-stretch ${className}`}>
      {children}
    </Tab.List>
  );
}

TabList.propTypes = {
  // Tailwind CSS classes to apply to the wrapper around the tabs; overrides the default
  className: PropTypes.string,
};

/**
 * Implements a single tab. Wrap each tab's title tab title within this component. You can use this
 * to wrap a simple string, a React component, or a function that returns a React component. In the
 * last case, the function receives a `selected` argument equal to `true` only for the selected
 * tab. This lets you render different content for the selected tab. The function also receives the
 * `isDisabled` argument for tabs the parent component has disabled. Disabled tabs do not react to
 * mouse clicks nor hovers.
 */
export function TabTitle({
  label = null,
  isDisabled = false,
  className = "items-center font-semibold",
  children,
}) {
  return (
    <Tab
      disabled={isDisabled}
      className={`flex items-stretch ${className}`}
      aria-label={label}
    >
      {({ selected }) => {
        return (
          <div
            className={`flex border-b-4 px-5 pb-1.5 pt-2 ${
              selected
                ? "pointer-events-none border-tab-selected text-tab-title-selected"
                : ""
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

TabTitle.propTypes = {
  // Accessible label if the tab title isn't enough
  label: PropTypes.string,
  // True to disable this tab
  isDisabled: PropTypes.bool,
  // Tailwind CSS classes to apply to each tab title; overrides the default
  className: PropTypes.string,
};

/**
 * Wraps all of the content areas for the tabs.
 */
export function TabPanes({ className = null, children }) {
  return <Tab.Panels className={className}>{children}</Tab.Panels>;
}

TabPanes.propTypes = {
  // Tailwind CSS classes to apply to the wrapper around all tab panes
  className: PropTypes.string,
};

/**
 * Wraps a single tab content area for a single tab.
 */
export function TabPane({ children }) {
  return <Tab.Panel>{children}</Tab.Panel>;
}
