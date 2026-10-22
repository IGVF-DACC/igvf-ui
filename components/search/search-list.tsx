// search
import { getSearchListItemRenderer, SearchListItem } from "../search/";
// root
import { DatabaseObject } from "../../globals";

/**
 * Renders a list of search results.
 *
 * @param items - The list of search result items to render
 * @param accessoryData - Optional accessory data for the search result items
 * @param className - Optional CSS class for the list container
 * @param isItemMarginTrimmed - True to trim the outer margin of the first and last search list
 *                              items
 */
export function SearchList({
  items,
  accessoryData,
  className,
  isItemMarginTrimmed = true,
}: {
  items: DatabaseObject[];
  accessoryData?: Record<string, object> | null;
  className?: string;
  isItemMarginTrimmed?: boolean;
}) {
  return (
    <ul data-testid="search-list" className={className}>
      {items.map((item) => {
        // For each item, get the appropriate search-list item renderer for it, or the
        // fallback render if the item type doesn't have one.
        const SearchListItemRenderer = getSearchListItemRenderer(item);
        return (
          <SearchListItem
            key={item["@id"]}
            testid={item["@id"]}
            href={item["@id"]}
            isMarginTrimmed={isItemMarginTrimmed}
          >
            <SearchListItemRenderer item={item} accessoryData={accessoryData} />
          </SearchListItem>
        );
      })}
    </ul>
  );
}
