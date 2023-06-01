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
// lib
import { getPhenotypicFeatureTitle } from "../../../lib/phenotypic-feature";

export default function PhenotypicFeature({ item: phenotypicFeature }) {
  const title = getPhenotypicFeatureTitle(phenotypicFeature);
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={phenotypicFeature} />
          {phenotypicFeature.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        {phenotypicFeature.observation_date && (
          <>
            <SearchListItemMeta>
              <div key="lab">{phenotypicFeature.observation_date}</div>
            </SearchListItemMeta>
          </>
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
