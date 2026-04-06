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
import { type AnalysisSetObject } from "../../../lib/file-sets";
import { truncateText } from "../../../lib/general";
import { isEmbedded, isEmbeddedArray } from "../../../lib/types";
import { WorkflowObject } from "../../../lib/workflow";
// root

type AccessoryData = {
  [analysisSetId: string]: {
    workflows?: WorkflowObject[];
  };
};

export default function AnalysisSet({
  item: analysisSet,
  accessoryData = null,
}: {
  item: AnalysisSetObject;
  accessoryData: AccessoryData | null;
}) {
  // Determine if at least one workflow in the analysis set has `uniform_pipeline` set.
  const accessoryAnalysisSet = accessoryData?.[analysisSet["@id"]];
  const workflows = accessoryAnalysisSet?.workflows || [];
  const isUniformPipeline = workflows.some(
    (workflow) => workflow.uniform_pipeline
  );

  // Collect all files.content_type and deduplicate.
  const fileContentType =
    analysisSet.files?.length > 0 && isEmbeddedArray(analysisSet.files)
      ? [...new Set(analysisSet.files.map((file) => file.content_type))].sort(
          (a, b) => a.localeCompare(b)
        )
      : [];

  const isSupplementsVisible =
    analysisSet.alternate_accessions ||
    analysisSet.description ||
    analysisSet.sample_summary ||
    fileContentType.length > 0 ||
    isUniformPipeline;

  const lab = isEmbedded(analysisSet.lab) ? analysisSet.lab : null;

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
          <span key="lab">{lab?.title}</span>
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={analysisSet} />
            {analysisSet.description && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Description
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {truncateText(analysisSet.description, 320)}
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
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={analysisSet}>
        {isUniformPipeline && <UniformlyProcessedBadge />}
        <ControlledAccessIndicator item={analysisSet} />
        <DataUseLimitationSummaries
          summaries={analysisSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

AnalysisSet.getAccessoryDataPaths = (items: AnalysisSetObject[]) => {
  // Get the `workflows` arrays for all analysis sets in the results.
  return [
    {
      type: "AnalysisSet",
      paths: items.map((item) => item["@id"]),
      fields: ["workflows"],
    },
  ];
};
