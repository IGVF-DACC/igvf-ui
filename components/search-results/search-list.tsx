// search
import { getSearchListItemRenderer, SearchListItem } from "../search/";
// root
import { DatabaseObject } from "../../globals";

/**
 * Renders a list of search results.
 *
 * @param items - The list of search result items to render.
 * @param accessoryData - Optional accessory data for the search result items.
 */
export function SearchList({
  items,
  accessoryData,
  className,
}: {
  items: DatabaseObject[];
  accessoryData?: Record<string, object> | null;
  className?: string;
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
          >
            <SearchListItemRenderer item={item} accessoryData={accessoryData} />
          </SearchListItem>
        );
      })}
    </ul>
  );
}
