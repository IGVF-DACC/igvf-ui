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

export default function Biosample({ item: biosample }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biosample} />
          {biosample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{biosample.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{biosample.lab.title}</div>
          {biosample.alternate_accessions?.length > 0 && (
            <div key="alternate_accessions">
              Alternate Accessions: {biosample.alternate_accessions.join(", ")}
            </div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={biosample} />
    </SearchListItemContent>
  );
}

Biosample.propTypes = {
  // Single biosample-derived search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
