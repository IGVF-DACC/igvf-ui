// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Biomarker({ item: biomarker, accessoryData }) {
  const lab = accessoryData?.[biomarker.lab];
  const titleElements = [biomarker.name, biomarker.quantification].filter(
    Boolean
  );
  const title = titleElements.join(" ");

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biomarker} />
          {title}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

Biomarker.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

Biomarker.getAccessoryDataPaths = (items) => {
  return items.map((item) => item.lab);
};
