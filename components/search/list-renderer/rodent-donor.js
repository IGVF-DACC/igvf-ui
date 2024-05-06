// node_modules
import _ from "lodash";
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

export default function RodentDonor({ item: rodentDonor }) {
  const lab = rodentDonor.lab;
  const collections =
    rodentDonor.collections?.length > 0
      ? rodentDonor.collections.join(", ")
      : "";
  let phenotypicFeatures = rodentDonor.phenotypic_features
    ? rodentDonor.phenotypic_features.map(
        (phenotypicFeature) => phenotypicFeature.feature.term_name
      )
    : [];
  phenotypicFeatures = _.uniq(phenotypicFeatures);

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
          {phenotypicFeatures.length > 0 && (
            <div key="phenotypes">{phenotypicFeatures.join(", ")}</div>
          )}
          {rodentDonor.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={rodentDonor.alternate_accessions}
            />
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
};
