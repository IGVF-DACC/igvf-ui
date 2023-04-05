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
  const lab = accessoryData?.[rodentDonor.lab];
  const collections =
    rodentDonor.collections?.length > 0
      ? rodentDonor.collections.join(", ")
      : "";
  // const phenotypicFeatures = rodentDonor.phenotypic_features
  //   ?.filter((path) => {
  //     return Boolean(accessoryData?.[path]);
  //   })
  //   .map((path) => {
  //     const feature = accessoryData[path];
  //     const notes = feature.notes ? feature.notes : "Amount";
  //     return `${notes} ${feature.quantity} ${feature.quantity_units}`;
  //   })
    // .join(", ");
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
        {(lab || collections) && (
          <SearchListItemMeta>
            {lab && <div key="lab">{lab.title}</div>}
            {collections && <div key="collections">{collections}</div>}
            {/* {phenotypicFeatures && (
              <div key="phenotypes">{phenotypicFeatures}</div>
            )} */}
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
  const labs = rodentDonors
    .map((rodentDonor) => rodentDonor.lab)
    .filter(Boolean);
  // A list of list of phenotypic features paths
  // const phenotypicFeatures = rodentDonors
  //   .map((rodentDonor) => rodentDonor.phenotypic_features)
  //   .filter(Boolean);
  return labs;
};
