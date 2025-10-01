// node_modules
import { Children, Fragment } from "react";
// components
import {
  CollapseControlInline,
  DEFAULT_MAX_COLLAPSE_ITEMS_INLINE,
  useCollapseControl,
} from "./collapse-control";

/**
 * Display a list of inline React components with a separator between the items -- sort of like
 * .join() but for React components. By default, the separator is a comma and a space. You can use
 * any sequence of characters as the separator, or even a React component as the separator. Wrap
 * your array of React components you want separated in a SeparatedList component:
 *
 * componentList = [First React component, Second React component, Third React component]
 * <SeparatedList separator = " . ">
 *   {componentList.map((component) => (
 *     <div key={component.id}>{component}</div>
 *   )}
 * </SeparatedList>
 * // Expected output: "First React component . Second React component . Third React component"
 *
 * If you provide individual components between the <SeparatedList> and </SeparatedList> tags
 * instead of a loop, each of these components must include a key attribute.
 *
 * You can nest SeparatedList components to combine separated lists. Make sure to give each child
 * SeparatedList a unique key:
 *
 * componentList0 = [First component, Second component]
 * componentList1 = [Third component, Fourth component]
 * <SeparatedList separator={<a> LINK </>}>
 *   <SeparatedList key="0">
 *     {componentList0.map((component) => (
 *       <div key={component.id}>{component}</div>
 *     )}
 *   </SeparatedList>
 *   <SeparatedList key="1">
 *     {componentList1.map((component) => (
 *       <div key={component.id}>{component}</div>
 *     )}
 *   </SeparatedList>
 * </SeparatedList>
 * // Expected output: "First component, Second component LINK Third component, Fourth component"
 *
 * @param separator - Separator between items; can be a string or a React component
 * @param className - Additional classes for the wrapper element
 * @param testid - Test ID for the wrapper element
 * @param isCollapsible - True if the list should be collapsible when it exceeds the maximum number
 *   of items before collapsing
 * @param maxItemsBeforeCollapse - Maximum number of items before the list appears collapsed
 */
export default function SeparatedList({
  separator = ", ",
  className = "",
  testid = null,
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_INLINE,
  children,
}: {
  separator?: React.ReactNode;
  className?: string;
  testid?: string | null;
  isCollapsible?: boolean;
  maxItemsBeforeCollapse?: number;
  children: React.ReactNode;
}) {
  const childrenArray = Children.toArray(children);
  const collapser = useCollapseControl(
    childrenArray,
    maxItemsBeforeCollapse,
    isCollapsible
  );
  const items = isCollapsible ? collapser.items : childrenArray;

  if (items.length > 0) {
    return (
      <div className={className || ""} data-testid={testid}>
        {items
          .filter(Boolean)
          .map((item) => <Fragment key={item.key}>{item}</Fragment>)
          .reduce((combined, curr, index) => [
            combined,
            <Fragment key={`sep-${index}`}>{separator}</Fragment>,
            <Fragment key={`sep-${index + 1}`}>
              {curr}
              {collapser.isCollapseControlVisible &&
              index === collapser.items.length - 1 ? (
                <CollapseControlInline
                  length={childrenArray.length}
                  isCollapsed={collapser.isCollapsed}
                  setIsCollapsed={collapser.setIsCollapsed}
                />
              ) : null}
            </Fragment>,
          ])}
      </div>
    );
  }
  return null;
}
