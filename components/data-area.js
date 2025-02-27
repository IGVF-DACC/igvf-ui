/**
 * Wrappers to display data items, typically used on pages that display a single object.
 *
 * <DataPanel>
 *   <DataArea>
 *     <DataItemLabel>Lab</DataItemLabel>
 *     <DataItemValue>{lab.title}</DataItemValue>
 *     ...
 *   </DataArea>
 * </DataPanel>
 */

// node_modules
import PropTypes from "prop-types";
import { Children } from "react";
// components
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "./collapse-control";
import { ButtonLink } from "./form-elements";
import { secDirId } from "./section-directory";

/**
 * Displays a panel -- typically to display data items for an object, but you can use this for
 * anything that should appear in a panel on the page.
 */
export function DataPanel({
  className = "",
  id = "",
  isPaddingSuppressed = false,
  children,
}) {
  return (
    <div
      className={`border border-panel bg-panel @container ${
        isPaddingSuppressed ? "" : "p-4"
      } ${className}`}
      data-testid="datapanel"
      id={id}
    >
      {children}
    </div>
  );
}

DataPanel.propTypes = {
  // Additional Tailwind CSS classes to add to the panel
  className: PropTypes.string,
  // HTML id attribute for the section directory
  id: PropTypes.string,
  // True if padding should be suppressed
  isPaddingSuppressed: PropTypes.bool,
};

/**
 * Wrapper for an area containing data items, setting up a grid to display labels on the left and
 * their values to their right on desktop. You only need this to wrap these kinds of data items.
 * Any display not comprising labels and their values can appear outside a <DataAre>.
 */
export function DataArea({ children }) {
  return (
    <div
      className="@md:grid @md:grid-cols-data-item @md:gap-4"
      data-testid="dataarea"
    >
      {children}
    </div>
  );
}

/**
 * Displays the title above a data panel or table.
 */
export function DataAreaTitle({
  id = "",
  secDirTitle = "",
  className = "flex items-end justify-between",
  children,
}) {
  // add a data-sec-dir attribute only if `secDirTitle` is provided. Don't include the attribute if
  // secDirTitle is an empty string.
  return (
    <h2
      id={`${id ? secDirId(id) : ""}`}
      className={`mb-1 mt-4 text-2xl font-light ${className}`}
      data-testid="dataareatitle"
      {...(secDirTitle ? { "data-sec-dir": secDirTitle } : {})}
    >
      {children}
    </h2>
  );
}

DataAreaTitle.propTypes = {
  // <h2> element HTML id attribute for the section directory
  id: PropTypes.string,
  // Title for the section directory menu if we don't want to use the <h2> text
  secDirTitle: PropTypes.string,
  // Additional Tailwind CSS classes to apply to the <h2> element
  className: PropTypes.string,
};

/**
 * Displays a link to the right of a data area title. This is typically used to link to a report
 * page for the data area.
 */
export function DataAreaTitleLink({ href, label, isExternal, children }) {
  return (
    <ButtonLink href={href} size="sm" label={label} isExternal={isExternal}>
      {children}
    </ButtonLink>
  );
}

DataAreaTitleLink.propTypes = {
  // Local URL to link to; don't use an external link
  href: PropTypes.string.isRequired,
  // Label for the link
  label: PropTypes.string.isRequired,
  // True if the link is external
  isExternal: PropTypes.bool,
};

/**
 * Display the label of a data item label/value pair.
 */
export function DataItemLabel({ className = "", children }) {
  return (
    <div
      className={`mt-4 break-words font-semibold text-data-label first:mt-0 @md:mt-0 dark:text-gray-400 ${className}`}
      data-testid="dataitemlabel"
    >
      {children}
    </div>
  );
}

DataItemLabel.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Display the value of a data item label/value pair.
 */
export function DataItemValue({ className = "", children }) {
  return (
    <div
      className={`mb-4 font-medium text-data-value last:mb-0 @md:mb-0 @md:min-w-0 ${className}`}
      data-testid="dataitemvalue"
    >
      {children}
    </div>
  );
}

DataItemValue.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
};

/**
 * Display a single boolean value as "True" or "False".
 * @param {string} className Additional Tailwind CSS classes to apply to the <div> element
 * @param {boolean} children The boolean value to display
 */
export function DataItemValueBoolean({ className = "", children = null }) {
  if (typeof children === "boolean") {
    return (
      <div
        className={`mb-4 font-medium text-data-value last:mb-0 @md:mb-0 @md:min-w-0 ${className}`}
        data-testid="dataitemvalue"
      >
        {children ? "True" : "False"}
      </div>
    );
  }
  return null;
}

DataItemValueBoolean.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
  // The boolean value to display
  children: PropTypes.bool,
};

/**
 * Display the value of a data item that consists of a URL. This will break the URL at any
 * character so it doesn't overflow the data panel.
 */
export function DataItemValueUrl({ className = "", children }) {
  return (
    <DataItemValue className={`break-all ${className}`}>
      {children}
    </DataItemValue>
  );
}

DataItemValueUrl.propTypes = {
  // Additional Tailwind CSS classes to apply to the <div> element
  className: PropTypes.string,
  // Element containing the URL to display, possibly a string
  children: PropTypes.node,
};

/**
 * Display a collapsable list of items in the value area of a data item.
 */
export function DataItemList({
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  isUrlList = false,
  children,
}) {
  const childArray = Children.toArray(children);
  const collapser = useCollapseControl(
    childArray,
    maxItemsBeforeCollapse,
    isCollapsible
  );

  const hasSingleChild = childArray.length === 1;
  const urlListCss = isUrlList ? "break-all" : "";

  return (
    <div>
      <ul className={hasSingleChild ? "" : "border border-data-list-item"}>
        {Children.map(collapser.items, (child) => (
          <li
            className={`${
              hasSingleChild
                ? ""
                : "border-b border-data-list-item px-2 py-0.5 last:border-none"
            } ${urlListCss}`}
          >
            {child}
          </li>
        ))}
      </ul>
      {collapser.isCollapseControlVisible && (
        <CollapseControlVertical
          length={children.length}
          isCollapsed={collapser.isCollapsed}
          setIsCollapsed={collapser.setIsCollapsed}
        />
      )}
    </div>
  );
}

DataItemList.propTypes = {
  // True if the list should be collapsible
  isCollapsible: PropTypes.bool,
  // Maximum number of items before the list appears collapsed
  maxItemsBeforeCollapse: PropTypes.number,
  // True if the list contains URLs, and should break on any character
  isUrlList: PropTypes.bool,
};
