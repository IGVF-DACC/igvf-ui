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

export default function Document({ item: document }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={document} />
          {document.attachment.download}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{document.description}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{document.lab.title}</span>
          <span key="document_type">{document.document_type}</span>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={document} />
    </SearchListItemContent>
  );
}

Document.propTypes = {
  // Single document search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
