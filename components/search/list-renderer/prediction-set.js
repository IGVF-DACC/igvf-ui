// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../alternate-accessions";
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

export default function PredictionSet({ item: predictionSet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={predictionSet} />
          {predictionSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {predictionSet.file_set_type} prediction
        </SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{predictionSet.lab.title}</div>
          {predictionSet.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={predictionSet.alternate_accessions}
            />
          )}
          <div key="scope">{predictionSet.scope}</div>
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={predictionSet} />
    </SearchListItemContent>
  );
}

PredictionSet.propTypes = {
  // Single prediction set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
