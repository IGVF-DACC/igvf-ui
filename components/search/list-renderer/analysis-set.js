// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementAlternateAccessions,
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// components
import { UniformlyProcessedBadge } from "../../common-pill-badges";
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";

export default function AnalysisSet({
  item: analysisSet,
  accessoryData = null,
}) {
  // Determine if at least one workflow in the analysis set has `uniform_pipeline` set.
  const accessoryAnalysisSet = accessoryData?.[analysisSet["@id"]];
  const workflows = accessoryAnalysisSet?.workflows || [];
  const isUniformPipeline = workflows.some(
    (workflow) => workflow.uniform_pipeline
  );
  // Collect all files.content_type and deduplicate
  const fileContentType =
    analysisSet.files.length > 0
      ? [...new Set(analysisSet.files.map((file) => file.content_type))].sort()
      : [];

  const isSupplementsVisible =
    analysisSet.alternate_accessions ||
    analysisSet.sample_summary ||
    fileContentType ||
    isUniformPipeline;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <span className="capitalize">
            {analysisSet.file_set_type.split(" ")[0]}
          </span>
          <SearchListItemType item={analysisSet} />
          {analysisSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{analysisSet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{analysisSet.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={analysisSet} />
            {fileContentType.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Files
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {fileContentType.join(", ")}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
            {analysisSet.sample_summary && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Samples
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {analysisSet.sample_summary}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={analysisSet}>
        {isUniformPipeline && <UniformlyProcessedBadge workflow={workflows} />}
        <ControlledAccessIndicator item={analysisSet} />
        <DataUseLimitationSummaries
          summaries={analysisSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

AnalysisSet.propTypes = {
  // Single analysis set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

AnalysisSet.getAccessoryDataPaths = (items) => {
  // Get the `workflows` arrays for all analysis sets in the results.
  return [
    {
      type: "AnalysisSet",
      paths: items.map((item) => item["@id"]),
      fields: ["workflows"],
    },
  ];
};
