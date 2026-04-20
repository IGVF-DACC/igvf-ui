// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// lib
import { isEmbedded } from "../../../lib/types";
// root
import type { SoftwareVersionObject } from "../../../globals";

/**
 * Render a single software version search result item in the search results list.
 *
 * @param item - Single software version object to display on a search-result list page.
 * @param accessoryData - Accessory data for the software version summary
 */
export default function SoftwareVersion({
  item,
  accessoryData = null,
}: {
  item: SoftwareVersionObject;
  accessoryData?: Record<string, { summary: string }> | null;
}) {
  const accessorySoftwareVersion = accessoryData?.[item["@id"]];
  const summary = accessorySoftwareVersion?.summary || item.name;
  const lab = isEmbedded(item.lab) ? item.lab : null;
  const labTitle = lab ? lab.title : "Unknown Lab";

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={item} />
        </SearchListItemUniqueId>
        <SearchListItemTitle>{summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{labTitle}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={item} />
    </SearchListItemContent>
  );
}

SoftwareVersion.getAccessoryDataPaths = (items) => {
  return [
    {
      type: "SoftwareVersion",
      paths: items.map((item) => item["@id"]),
      fields: ["summary"],
    },
  ];
};
