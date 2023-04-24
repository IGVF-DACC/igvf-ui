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

export default function RodentDonor({ item: rodentDonor, accessoryData }) {
  const lab = rodentDonor.lab;
  const collections =
    rodentDonor.collections?.length > 0
      ? rodentDonor.collections.join(", ")
      : "";
  const phenotypicFeatures = rodentDonor.phenotypic_features
    ?.filter((path) => {
      const keys = Object.keys(accessoryData);
      return keys.includes(path);
    })
    .map((path) => {
      const feature = accessoryData[path];
      if (feature.quantity) {
        return `${feature.feature.term_name} ${feature.quantity} ${
          feature.quantity_units
        }${feature.quantity === 1 ? "" : "s"}`;
      }
      return feature.feature.term_name;
    })
    .join(", ");
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={rodentDonor} />
          {rodentDonor.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {rodentDonor.strain} {rodentDonor.sex}
        </SearchListItemTitle>
        {(lab || collections || phenotypicFeatures) && (
          <SearchListItemMeta>
            {lab && <div key="lab">{lab.title}</div>}
            {collections && <div key="collections">{collections}</div>}
            {phenotypicFeatures && (
              <div key="phenotypes">{phenotypicFeatures}</div>
            )}
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={rodentDonor} />
    </SearchListItemContent>
  );
}

RodentDonor.propTypes = {
  // Single rodent-donor search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

RodentDonor.getAccessoryDataPaths = (rodentDonors) => {
  const phenotypicFeatures = rodentDonors
    .map((rodentDonor) => rodentDonor.phenotypic_features)
    .filter(Boolean)
    .flat(1);
  return phenotypicFeatures;
};
