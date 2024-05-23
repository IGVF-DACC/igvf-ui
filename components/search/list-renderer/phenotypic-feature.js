// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// lib
import { formatDate } from "../../../lib/dates";
import { getPhenotypicFeatureTitle } from "../../../lib/phenotypic-feature";

export default function PhenotypicFeature({ item: phenotypicFeature }) {
  const title = getPhenotypicFeatureTitle(phenotypicFeature);
  const isSupplementVisible = Boolean(phenotypicFeature.observation_date);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={phenotypicFeature} />
          {phenotypicFeature.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Observation Date
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {formatDate(phenotypicFeature.observation_date)}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={phenotypicFeature} />
    </SearchListItemContent>
  );
}

PhenotypicFeature.propTypes = {
  // Single PhenotypicFeature search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
