// node_modules
import PropTypes from "prop-types";
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

export default function HumanDonor({ item: humanDonor, accessoryData }) {
  const ethnicities =
    humanDonor.ethnicities?.length > 0 ? humanDonor.ethnicities.join(", ") : "";
  const sex = humanDonor.sex || "";
  const title = [ethnicities, sex].filter(Boolean);
  const collections =
    humanDonor.collections?.length > 0 ? humanDonor.collections.join(", ") : "";
  const phenotypicFeatures = humanDonor.phenotypic_features
    ?.filter((path) => {
      return Boolean(accessoryData?.[path]);
    })
    .map((path) => {
      const feature = accessoryData[path];
      const notes = feature.notes ? feature.notes : "Amount";
      return `${notes} ${feature.quantity} ${feature.quantity_units}`;
    })
    .join(", ");

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={humanDonor} />
          {humanDonor.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {title.length > 0 ? title.join(" ") : humanDonor["@id"]}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{humanDonor.lab.title}</div>
          {collections && <div key="collections">{collections}</div>}
          {phenotypicFeatures && (
            <div key="phenotypic-features">{phenotypicFeatures}</div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={humanDonor} />
    </SearchListItemContent>
  );
}

HumanDonor.propTypes = {
  // Single human-donor search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

HumanDonor.getAccessoryDataPaths = (humanDonors) => {
  // A list of list of phenotypic features paths
  const phenotypicFeatures = humanDonors
    .map((humanDonor) => humanDonor.phenotypic_features)
    .filter(Boolean);
  return phenotypicFeatures.flat();
};
