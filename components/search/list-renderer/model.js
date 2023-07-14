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

export default function Model({ item: model }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={model} />
          {model.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{model.model_name}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{model.lab.title}</div>
          {model.summary && <div key="summary">{model.summary}</div>}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={model} />
    </SearchListItemContent>
  );
}

Model.propTypes = {
  // Single model search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
