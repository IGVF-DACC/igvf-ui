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

export default function MultiplexedSample({ item: multiplexedSample }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={multiplexedSample} />
          {multiplexedSample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{multiplexedSample.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{multiplexedSample.lab.title}</div>
          {multiplexedSample.alternate_accessions?.length > 0 && (
            <div key="alternate_accessions">
              Alternate Accessions:{" "}
              {multiplexedSample.alternate_accessions.join(", ")}
            </div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={multiplexedSample} />
    </SearchListItemContent>
  );
}

MultiplexedSample.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
