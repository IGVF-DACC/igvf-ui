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

export default function RodentDonor({
  item: rodentDonor,
  accessoryData = null,
}) {
  const lab = rodentDonor.lab;
  const collections =
    rodentDonor.collections?.length > 0
      ? rodentDonor.collections.join(", ")
      : "";
  const phenotypicFeatures = accessoryData
    ? rodentDonor.phenotypic_features
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
        .join(", ")
    : "";
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
        <SearchListItemMeta>
          <div key="lab">{lab.title}</div>
          {collections && <div key="collections">{collections}</div>}
          {phenotypicFeatures && (
            <div key="phenotypes">{phenotypicFeatures}</div>
          )}
          {rodentDonor.alternate_accessions?.length > 0 && (
            <div key="alternate_accessions">
              Alternate Accessions:{" "}
              {rodentDonor.alternate_accessions.join(", ")}
            </div>
          )}
        </SearchListItemMeta>
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
  return [
    {
      type: "PhenotypicFeature",
      paths: phenotypicFeatures,
      fields: ["quantity", "quantity_units", "feature"],
    },
  ];
};
