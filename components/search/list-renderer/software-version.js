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

export default function SoftwareVersion({
  item: softwareVersion,
  accessoryData,
}) {
  const lab = accessoryData?.[softwareVersion.lab];
  const titleElements = [
    softwareVersion.software?.title,
    softwareVersion.version,
  ].filter(Boolean);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={softwareVersion} />
          {softwareVersion.name}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{titleElements.join(" ")}</SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={softwareVersion} />
    </SearchListItemContent>
  );
}

SoftwareVersion.propTypes = {
  // Single SoftwareVersion search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

SoftwareVersion.getAccessoryDataPaths = (softwareVersions) => {
  return softwareVersions.map((softwareVersion) => softwareVersion.lab);
};
