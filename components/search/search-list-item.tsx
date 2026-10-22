// node_modules
import { ReactNode } from "react";
// components
import ItemLink from "../item-link";

/**
 * Displays a single item on a search-list view.
 *
 * @param href - Path to item this item links to
 * @param testid - Usually same as component key; unique on page
 * @param isMarginTrimmed - Remove the outer margins from the first and last items
 */
export function SearchListItem({
  href,
  testid,
  isMarginTrimmed = true,
  children,
}: {
  href: string;
  testid: string;
  isMarginTrimmed?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={`border-data-border bg-data-background my-0.5 flex border px-2 ${
        isMarginTrimmed ? "first:mt-0 last:mb-0" : ""
      }`}
      data-testid={`search-list-item-${testid}`}
    >
      <ItemLink href={href} label={`View details for ${testid}`} />
      <div className="grow px-2 py-4 sm:px-4">{children}</div>
    </li>
  );
}
