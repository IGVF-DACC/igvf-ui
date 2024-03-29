// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import AlternateAccessions from "../../alternate-accessions";
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function HumanDonor({ item: humanDonor, accessoryData = null }) {
  const ethnicities =
    humanDonor.ethnicities?.length > 0 ? humanDonor.ethnicities.join(", ") : "";
  const sex = humanDonor.sex || "";
  const title = [ethnicities, sex].filter(Boolean);
  const collections =
    humanDonor.collections?.length > 0 ? humanDonor.collections.join(", ") : "";

  const phenotypicFeatures = accessoryData
    ? humanDonor.phenotypic_features
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
          {humanDonor.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={humanDonor.alternate_accessions}
            />
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
