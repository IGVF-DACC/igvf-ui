// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementAlternateAccessions,
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
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
  const isSupplementsVisible =
    rodentDonor.alternate_accessions?.length > 0 ||
    phenotypicFeatures.length > 0;

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
          <span key="lab">{lab.title}</span>
          {collections && <span key="collections">{collections}</span>}
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={rodentDonor} />
            {phenotypicFeatures.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Phenotypic Features
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <span key="phenotypes">{phenotypicFeatures.join(", ")}</span>
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={rodentDonor} />
    </SearchListItemContent>
  );
}

RodentDonor.propTypes = {
  // Single rodent-donor search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
