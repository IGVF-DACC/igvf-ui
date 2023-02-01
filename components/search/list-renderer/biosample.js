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

const Biosample = ({ item: biosample, accessoryData }) => {
  const biosampleTerm = accessoryData?.[biosample.biosample_term];
  const titleElements = [biosample.taxa, biosampleTerm?.term_name].filter(
    Boolean
  );
  const lab = accessoryData?.[biosample.lab];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={biosample} />
          {biosample.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{titleElements.join(" ")}</SearchListItemTitle>
        {lab && (
          <SearchListItemMeta>
            <div key="lab">{lab.title}</div>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={biosample} />
    </SearchListItemContent>
  );
};

Biosample.propTypes = {
  // Single biosample-derived search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

Biosample.getAccessoryDataPaths = (biosample) => {
  const terms = biosample.map(
    (differentiatedCell) => differentiatedCell.biosample_term
  );
  const labs = biosample
    .map((differentiatedCell) => differentiatedCell.lab)
    .filter(Boolean);
  return terms.concat(labs);
};

export default Biosample;
