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

export default function TechnicalSample({
  item: technicalSample,
  accessoryData,
}) {
  const technicalSampleTerm =
    accessoryData?.[technicalSample.technical_sample_term];
  const lab = accessoryData?.[technicalSample.lab];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={technicalSample} />
          {technicalSample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {technicalSampleTerm?.term_id || technicalSample["@id"]}
        </SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={technicalSample} />
    </SearchListItemContent>
  );
}

TechnicalSample.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

TechnicalSample.getAccessoryDataPaths = (technicalSamples) => {
  const terms = technicalSamples.map(
    (technicalSample) => technicalSample.technical_sample_term
  );
  const labs = technicalSamples.map((technicalSample) => technicalSample.lab);
  return terms.concat(labs);
};
