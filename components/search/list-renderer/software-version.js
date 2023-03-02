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
      <SearchListItemQuality item={softwareVersion} />
    </SearchListItemContent>
  );
}

SoftwareVersion.propTypes = {
  // Single SoftwareVersion search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
