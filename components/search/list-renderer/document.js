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

const Document = ({ item: document, accessoryData }) => {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={document} />
          {document.attachment.download}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{document.description}</SearchListItemTitle>
        <SearchListItemMeta>
          {accessoryData && accessoryData[document.lab] && (
            <div key="lab">{accessoryData[document.lab].title}</div>
          )}
          <div key="document_type">{document.document_type}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemStatus item={document} />
    </SearchListItemContent>
  );
};

Document.propTypes = {
  // Single document search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

Document.getAccessoryDataPaths = (documents) => {
  return documents.map((document) => document.lab).filter(Boolean);
};

export default Document;
