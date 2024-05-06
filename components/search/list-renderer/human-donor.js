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

export default function HumanDonor({ item: humanDonor }) {
  const ethnicities =
    humanDonor.ethnicities?.length > 0 ? humanDonor.ethnicities.join(", ") : "";
  const sex = humanDonor.sex || "";
  const title = [ethnicities, sex].filter(Boolean);
  const collections =
    humanDonor.collections?.length > 0 ? humanDonor.collections.join(", ") : "";
  let phenotypicFeatures = humanDonor.phenotypic_features
    ? humanDonor.phenotypic_features.map(
        (phenotypicFeature) => phenotypicFeature.feature.term_name
      )
    : [];
  phenotypicFeatures = _.uniq(phenotypicFeatures);

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
          {phenotypicFeatures.length > 0 && (
            <div key="phenotypic-features">{phenotypicFeatures.join(", ")}</div>
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
};
