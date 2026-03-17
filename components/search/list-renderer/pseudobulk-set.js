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
// lib
import { truncateText } from "../../../lib/general";

export default function PseudobulkSet({
  item: pseudobulkSet,
  accessoryData = null,
}) {
  // Determine if at least one workflow in the pseudobulk set has `uniform_pipeline` set.
  const accessoryPseudobulkSet = accessoryData?.[pseudobulkSet["@id"]];
  const workflows = accessoryPseudobulkSet?.workflows || [];
  const isUniformPipeline = workflows.some(
    (workflow) => workflow.uniform_pipeline
  );
  // Collect all files.content_type and deduplicate
  const fileContentType =
    pseudobulkSet.files?.length > 0
      ? [
          ...new Set(pseudobulkSet.files.map((file) => file.content_type)),
        ].sort()
      : [];

  const isSupplementsVisible =
    pseudobulkSet.alternate_accessions ||
    pseudobulkSet.description ||
    pseudobulkSet.samples.summary ||
    fileContentType.length > 0 ||
    isUniformPipeline;

  const samplesSummary =
    pseudobulkSet.samples?.length > 0
      ? [
          ...new Set(pseudobulkSet.samples.map((sample) => sample.summary)),
        ].sort()
      : [];

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={pseudobulkSet} />
          {pseudobulkSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{pseudobulkSet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{pseudobulkSet.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={pseudobulkSet} />
            {pseudobulkSet.description && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Description
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {truncateText(pseudobulkSet.description, 320)}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
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
            {pseudobulkSet.cell_type && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Cell Type
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {pseudobulkSet.cell_type.term_name}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
            {samplesSummary.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Samples
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {samplesSummary.join(", ")}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={pseudobulkSet}>
        {isUniformPipeline && <UniformlyProcessedBadge />}
        <ControlledAccessIndicator item={pseudobulkSet} />
        <DataUseLimitationSummaries
          summaries={pseudobulkSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

PseudobulkSet.propTypes = {
  // Single pseudobulk set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

PseudobulkSet.getAccessoryDataPaths = (items) => {
  // Get the `workflows` arrays for all pseudobulk sets in the results.
  return [
    {
      type: "PseudobulkSet",
      paths: items.map((item) => item["@id"]),
      fields: ["workflows"],
    },
  ];
};
