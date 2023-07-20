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
// lib
import { getBiomarkerTitle } from "../../../lib/biomarker";
import { getBiomarkerSearchIdentifier } from "../../../lib/biomarker";

export default function Biomarker({ item: biomarker }) {
  const title = getBiomarkerTitle(biomarker);
  const searchIdentifier = getBiomarkerSearchIdentifier(biomarker);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biomarker} />
          {searchIdentifier}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{biomarker.lab.title}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={biomarker} />
    </SearchListItemContent>
  );
}

Biomarker.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
