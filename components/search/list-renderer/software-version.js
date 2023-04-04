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

export default function SoftwareVersion({ item: softwareVersion }) {
  const titleElements = [
    softwareVersion.software?.title,
    softwareVersion.version,
  ].filter(Boolean);
  const title = titleElements.join(" ");
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={softwareVersion} />
          {title}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{softwareVersion.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemStatus item={softwareVersion} />
    </SearchListItemContent>
  );
}

SoftwareVersion.propTypes = {
  // Single SoftwareVersion search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
