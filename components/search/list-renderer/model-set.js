// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementAlternateAccessions,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// components
import { ExternallyHostedBadge } from "../../common-pill-badges";
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";

export default function ModelSet({ item: modelSet, accessoryData = null }) {
  const isExternallyHosted =
    accessoryData?.[modelSet["@id"]].externally_hosted ?? false;
  const isSupplementsVisible = modelSet.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={modelSet} />
          {modelSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{modelSet.model_name}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{modelSet.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={modelSet} />
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={modelSet}>
        {isExternallyHosted && <ExternallyHostedBadge />}
        <ControlledAccessIndicator item={modelSet} />
        <DataUseLimitationSummaries
          summaries={modelSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

ModelSet.propTypes = {
  // Single ModelSet search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

ModelSet.getAccessoryDataPaths = (items) => {
  // Get the displayed measurement-set objects to get their `externally_hosted` properties.
  return [
    {
      type: "ModelSet",
      paths: items.map((item) => item["@id"]),
      fields: ["externally_hosted"],
    },
  ];
};
