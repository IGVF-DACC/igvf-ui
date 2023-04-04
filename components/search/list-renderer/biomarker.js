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
import { getBiomarkerTitle } from "../../../lib/biomarker";

export default function Biomarker({ item: biomarker }) {
  const title = getBiomarkerTitle(biomarker);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biomarker} />
          {biomarker.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{biomarker.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

Biomarker.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
