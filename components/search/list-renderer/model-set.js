// node_modules
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

export default function ModelSet({ item: modelSet }) {
  const isSupplementsVisible =
    modelSet.summary || modelSet.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={modelSet} />
          {modelSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{modelSet.model_name}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{modelSet.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={modelSet} />
            {modelSet.summary && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Summary
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {modelSet.summary}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={modelSet} />
    </SearchListItemContent>
  );
}

ModelSet.propTypes = {
  // Single ModelSet search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
