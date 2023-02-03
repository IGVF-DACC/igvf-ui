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

const AnalysisSet = ({ item: analysisSet, accessoryData }) => {
  //   const ethnicities =
  //     analysisSet.ethnicity?.length > 0 ? analysisSet.ethnicity.join(", ") : "";
  //   const sex = analysisSet.sex || "";
  //   const title = [ethnicities, sex].filter(Boolean);
  //   const lab = accessoryData?.[analysisSet.lab];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisSet} />
          {analysisSet.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          <SearchListItemType item={analysisSet} />
        </SearchListItemTitle>
      </SearchListItemMain>
      <SearchListItemStatus item={analysisSet} />
    </SearchListItemContent>
  );
};

AnalysisSet.propTypes = {
  // Single human-donor search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

// AnalysisSet.getAccessoryDataPaths = (humanDonors) => {
//   return humanDonors.map((humanDonor) => humanDonor.lab).filter(Boolean);
// };

export default AnalysisSet;
