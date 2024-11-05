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

  const isSupplementsVisible =
    analysisSet.alternate_accessions?.length > 0 ||
    analysisSet.sample_summary ||
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
        {isUniformPipeline && (
          <div className="flex h-[22px] items-center gap-1 self-start rounded-full border border-amber-800 bg-amber-200 px-2 text-xs font-semibold uppercase text-amber-800 dark:border-amber-500 dark:bg-amber-900 dark:text-amber-200">
            Uniformly Processed
          </div>
        )}
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
