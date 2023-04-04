// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemStatus,
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
          <div key="lab">{document.lab.title}</div>
          <div key="document_type">{document.document_type}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemStatus item={document} />
    </SearchListItemContent>
  );
}

Document.propTypes = {
  // Single document search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
