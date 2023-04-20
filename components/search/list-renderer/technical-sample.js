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

export default function TechnicalSample({ item: technicalSample }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={technicalSample} />
          {technicalSample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{technicalSample.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{technicalSample.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={technicalSample} />
    </SearchListItemContent>
  );
}

TechnicalSample.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
