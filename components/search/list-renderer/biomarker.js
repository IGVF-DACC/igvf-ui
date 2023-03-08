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
// lib
import { getTitle } from "../../../lib/biomarker";

export default function Biomarker({ item: biomarker, accessoryData }) {
  const lab = accessoryData?.[biomarker.lab];
  const title = getTitle(biomarker);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biomarker} />
          {biomarker.uuid}
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
