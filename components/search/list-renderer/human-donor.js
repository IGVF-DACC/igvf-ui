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

export default function HumanDonor({ item: humanDonor }) {
  const ethnicities =
    humanDonor.ethnicities?.length > 0 ? humanDonor.ethnicities.join(", ") : "";
  const humanDonorIdentifiers =
    humanDonor.human_donor_identifiers?.length > 0
      ? humanDonor.human_donor_identifiers.join(", ")
      : "";
  const sex = humanDonor.sex || "";
  const demographic = [ethnicities, sex].filter(Boolean).join(", ");
  const title = humanDonorIdentifiers
    ? `${humanDonorIdentifiers} donor${demographic ? ` (${demographic})` : ""}`
    : demographic
      ? `${demographic} donor`
      : humanDonor["@id"];
  const collections =
    humanDonor.collections?.length > 0 ? humanDonor.collections.join(", ") : "";
  let phenotypicFeatures = humanDonor.phenotypic_features
    ? humanDonor.phenotypic_features.map(
        (phenotypicFeature) => phenotypicFeature.feature.term_name
      )
    : [];
  phenotypicFeatures = _.uniq(phenotypicFeatures);
  const isSupplementVisible =
    collections ||
    humanDonor.alternate_accessions?.length > 0 ||
    phenotypicFeatures.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={humanDonor} />
          {humanDonor.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{humanDonor.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={humanDonor} />
            {collections && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Collection
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {collections}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
            {phenotypicFeatures.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Phenotypic Feature
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {phenotypicFeatures.join(", ")}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={humanDonor} />
    </SearchListItemContent>
  );
}

HumanDonor.propTypes = {
  // Single human-donor search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
