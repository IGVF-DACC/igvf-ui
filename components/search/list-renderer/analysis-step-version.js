// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function AnalysisStepVersion({ item: analysisStepVersion }) {
  const softwareVersions = analysisStepVersion.software_versions
    ? analysisStepVersion.software_versions.map((version) => version.name)
    : [];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisStepVersion} />
          {analysisStepVersion.uuid}
        </SearchListItemUniqueId>
        {analysisStepVersion.analysis_step && (
          <SearchListItemTitle>
            <div key="software-versions">
              {analysisStepVersion.analysis_step.title} {"Version"}
            </div>
          </SearchListItemTitle>
        )}
        <SearchListItemMeta>
          <span key="lab">{analysisStepVersion.lab.title}</span>
        </SearchListItemMeta>
        <SearchListItemSupplement>
          {softwareVersions.length > 0 && (
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Software Versions
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {softwareVersions.join(", ")}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          )}
        </SearchListItemSupplement>
      </SearchListItemMain>
      <SearchListItemQuality item={analysisStepVersion} />
    </SearchListItemContent>
  );
}

AnalysisStepVersion.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
