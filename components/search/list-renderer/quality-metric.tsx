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
import {
  qualityMetricTitle,
  type QualityMetricObject,
} from "../../../lib/quality-metric";
// root
import type { LabObject } from "../../../globals";

export default function QualityMetric({
  item,
  accessoryData,
}: {
  item: QualityMetricObject;
  accessoryData?: Record<string, any>;
}) {
  const description = accessoryData?.[item["@id"]]?.description || "";
  const itemWithDescription = {
    ...item,
    description,
  };

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={item} />
          {item.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {qualityMetricTitle(itemWithDescription)}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{(item.lab as LabObject).title}</span>
        </SearchListItemMeta>
        <SearchListItemQuality item={item} />
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

QualityMetric.getAccessoryDataPaths = (items) => {
  return [
    {
      type: "QualityMetric",
      paths: items.map((item) => item["@id"]),
      fields: ["description"],
    },
  ];
};
