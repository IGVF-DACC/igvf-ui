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
import { Children } from "react";
// components
import { AnnotatedValue } from "./annotated-value";
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "./collapse-control";
import { ButtonLink } from "./form-elements";
import { secDirId } from "./section-directory";
import SeparatedList from "./separated-list";

/**
 * Displays a panel -- typically to display data items for an object, but you can use this for
 * anything that should appear in a panel on the page.
 *
 * @param className - Additional Tailwind CSS classes to add to the panel
 * @param id - HTML id attribute for the section directory
 * @param isPaddingSuppressed - True if padding should be suppressed
 */
export function DataPanel({
  className = "",
  id = "",
  isPaddingSuppressed = false,
  children,
}: {
  className?: string;
  id?: string;
  isPaddingSuppressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border-panel bg-panel @container border ${
        isPaddingSuppressed ? "" : "p-4"
      } ${className}`}
      data-testid="datapanel"
      id={id}
    >
      {children}
    </div>
  );
}

/**
 * Wrapper for an area containing data items, setting up a grid to display labels on the left and
 * their values to their right on desktop. You only need this to wrap these kinds of data items.
 * Any display not comprising labels and their values can appear outside a <DataAre>.
 *
 * @param isSmall - True to display the small version of the data area
 */
export function DataArea({
  isSmall = false,
  children,
}: {
  isSmall?: boolean;
  children: React.ReactNode;
}) {
  const containerClasses = isSmall
    ? "@xs:grid @xs:grid-cols-data-item-small @xs:gap-2 text-sm"
    : "@md:grid @md:grid-cols-data-item @md:gap-4";

  return (
    <div className={containerClasses} data-testid="dataarea">
      {children}
    </div>
  );
}

/**
 * Displays the title above a data panel or table.
 *
 * @param id - HTML id attribute for the section directory; if not provided, no id attribute is set
 * @param secDirTitle - Title for the section directory menu if we don't want to use the <h2> text
 * @param className - Additional Tailwind CSS classes to apply to the <h2> element
 */
export function DataAreaTitle({
  id = "",
  secDirTitle = "",
  className = "flex items-end justify-between",
  children,
}: {
  id?: string;
  secDirTitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // add a data-sec-dir attribute only if `secDirTitle` is provided. Don't include the attribute if
  // secDirTitle is an empty string.
  return (
    <h2
      id={`${id ? secDirId(id) : ""}`}
      className={`mt-4 mb-1 text-2xl font-light ${className}`}
      data-testid="dataareatitle"
      {...(secDirTitle ? { "data-sec-dir": secDirTitle } : {})}
    >
      {children}
    </h2>
  );
}

/**
 * Displays a link to the right of a data area title. This is typically used to link to a report
 * page for the data area.
 *
 * @param href - Local URL to link to; don't use an external link
 * @param label - Label for the link
 * @param isExternal - True if the link is external
 */
export function DataAreaTitleLink({
  href,
  label,
  isExternal,
  children,
}: {
  href: string;
  label: string;
  isExternal?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ButtonLink href={href} size="sm" label={label} isExternal={isExternal}>
      {children}
    </ButtonLink>
  );
}

/**
 * Display the label of a data item label/value pair.
 *
 * @param className - Additional Tailwind CSS classes to apply to the <div> element
 * @param isSmall - True to use the small versions of labels and values
 */
export function DataItemLabel({
  className = "",
  isSmall = false,
  children,
}: {
  className?: string;
  isSmall?: boolean;
  children: React.ReactNode;
}) {
  const containerClasses = isSmall ? "mt-2 @xs:mt-0" : "mt-4 @xs:mt-0";
  return (
    <div
      className={`text-data-label font-semibold break-words first:mt-0 dark:text-gray-400 ${containerClasses} ${className}`}
      data-testid="dataitemlabel"
    >
      {children}
    </div>
  );
}

/**
 * Display the value of a data item label/value pair.
 *
 * @param className - Additional Tailwind CSS classes to apply to the <div> element
 * @param isSmall - True to use the small versions of labels and values
 */
export function DataItemValue({
  className = "",
  isSmall = false,
  children,
}: {
  className?: string;
  isSmall?: boolean;
  children: React.ReactNode;
}) {
  const containerClasses = isSmall
    ? "mb-2 @xs:mb-0 @xs:min-w-0"
    : "mb-4 @md:mb-0 @md:min-w-0";
  return (
    <div
      className={`text-data-value font-medium last:mb-0 ${containerClasses} ${className}`}
      data-testid="dataitemvalue"
    >
      {children}
    </div>
  );
}

/**
 * Display a single boolean value as "True" or "False".
 *
 * @param className - Additional Tailwind CSS classes to apply to the <div> element
 * @param children - The boolean value to display
 */
export function DataItemValueBoolean({
  className = "",
  children = null,
}: {
  className?: string;
  children?: boolean | null;
}) {
  if (typeof children === "boolean") {
    return (
      <div
        className={`text-data-value mb-4 font-medium last:mb-0 @md:mb-0 @md:min-w-0 ${className}`}
        data-testid="dataitemvalue"
      >
        {children ? "True" : "False"}
      </div>
    );
  }
  return null;
}

/**
 * Display the value of a data item that consists of a URL. This will break the URL at any
 * character so it doesn't overflow the data panel.
 *
 * @param className - Additional Tailwind CSS classes to apply to the <div> element
 */
export function DataItemValueUrl({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <DataItemValue className={`break-all ${className}`}>
      {children}
    </DataItemValue>
  );
}

/**
 * Display a collapsable list of items in the value area of a data item.
 *
 * @param isCollapsible - True if the list should be collapsible
 * @param maxItemsBeforeCollapse - Maximum number of items before the list appears collapsed
 * @param isUrlList - True if the list contains URLs, and should break on any character
 */
export function DataItemList({
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  isUrlList = false,
  children,
}: {
  isCollapsible?: boolean;
  maxItemsBeforeCollapse?: number;
  isUrlList?: boolean;
  children: React.ReactNode;
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
      <ul className={hasSingleChild ? "" : "border-data-list-item border"}>
        {Children.map(collapser.items, (child) => (
          <li
            className={`${
              hasSingleChild
                ? ""
                : "border-data-list-item border-b px-2 py-0.5 last:border-none"
            } ${urlListCss}`}
          >
            {child}
          </li>
        ))}
      </ul>
      {collapser.isCollapseControlVisible && (
        <CollapseControlVertical
          length={childArray.length}
          isCollapsed={collapser.isCollapsed}
          setIsCollapsed={collapser.setIsCollapsed}
        />
      )}
    </div>
  );
}

/**
 * Display a data item value with annotation that appear in tooltips. The children of this
 * component can be a single string or an array of strings. If the array of child strings contains
 * duplicates, this component de-duplicates them so each unique value appears only once with its
 * annotation.
 *
 * Supply either `objectType` and `propertyName` to get the annotations from the schema of the
 * object being displayed, or provide `externalAnnotations` to use a mapping from a source other
 * than the schema.
 *
 * @param objectType - @type of object this property belongs to in the schema
 * @param propertyName - Name of the object property being displayed in the schema
 * @param externalAnnotations - Map of values to descriptions if not using the schema
 * @param className - Additional Tailwind CSS classes to apply to the element
 * @param isSmall - True to use the small versions of labels and values
 */
export function DataItemValueAnnotated({
  objectType = "",
  propertyName = "",
  externalAnnotations = {},
  className = "",
  isSmall = false,
  children,
}: {
  objectType?: string;
  propertyName?: string;
  externalAnnotations?: Record<string, string>;
  className?: string;
  isSmall?: boolean;
  children: string | string[];
}) {
  const childArray = Array.isArray(children) ? children : [children];
  const uniqueChildren = [...new Set(childArray)];
  const sortedChildren = uniqueChildren.toSorted((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );

  return (
    <DataItemValue className={className} isSmall={isSmall}>
      <SeparatedList>
        {sortedChildren.map((child) => (
          <AnnotatedValue
            key={child}
            objectType={objectType}
            propertyName={propertyName}
            externalAnnotations={externalAnnotations}
          >
            {child}
          </AnnotatedValue>
        ))}
      </SeparatedList>
    </DataItemValue>
  );
}
