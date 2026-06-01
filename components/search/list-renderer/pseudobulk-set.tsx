// node_modules
import _ from "lodash";
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
import { SampleAnnotatedSummary } from "../../sample-annotated-summary";
// lib
import { isDatabaseObjectArrayOfType } from "../../../lib/database-object";
import { type PseudobulkSetObject } from "../../../lib/file-sets";
import { truncateText } from "../../../lib/general";
import { isEmbedded } from "../../../lib/types";

/**
 * A subset of the `PseudobulkSetObject` fields that appears in accessory data for the pseudobulk
 * set list renderer.
 */
type PseudobulkSetSubset = Pick<
  PseudobulkSetObject,
  "@id" | "@type" | "cell_annotation" | "cell_type" | "workflows"
>;

/**
 * List renderer for pseudobulk sets.
 *
 * @param item - A pseudobulk set search-result object to display on a search-result list page.
 * @param accessoryData - Accessory data to display for all search-result objects, which may include
 *                        additional fields not present in the main search result object.
 */
export default function PseudobulkSet({
  item: pseudobulkSet,
  accessoryData = null,
}: {
  item: PseudobulkSetObject;
  accessoryData?: Record<string, PseudobulkSetSubset> | null;
}) {
  const samplesSummary = isDatabaseObjectArrayOfType(
    pseudobulkSet.samples,
    "Sample"
  )
    ? _.sortBy(
        [...new Set(pseudobulkSet.samples.map((sample) => sample.summary))],
        (item) => item.toLowerCase()
      )
    : [];

  // Determine if at least one workflow in the analysis set has `uniform_pipeline` set.
  const accessoryPseudobulkSet = accessoryData?.[pseudobulkSet["@id"]];
  const workflows =
    accessoryPseudobulkSet &&
    isDatabaseObjectArrayOfType(accessoryPseudobulkSet.workflows, "Workflow")
      ? accessoryPseudobulkSet.workflows
      : [];
  const isUniformPipeline = workflows.some(
    (workflow) => workflow.uniform_pipeline
  );

  // If the accessory data has a `cell_type` property, use it to get definitions for tooltips on
  // `cell_annotation` summary. We eventually need to also retrieve sample terms to get more
  // complete tooltips.
  const allSampleTerms = isEmbedded(accessoryPseudobulkSet?.cell_type)
    ? [accessoryPseudobulkSet.cell_type]
    : [];

  const isSupplementsVisible = Boolean(
    pseudobulkSet.alternate_accessions ||
    pseudobulkSet.description ||
    pseudobulkSet.cell_annotation ||
    samplesSummary.length > 0 ||
    isUniformPipeline
  );

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={pseudobulkSet} />
          {pseudobulkSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{pseudobulkSet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">
            {isEmbedded(pseudobulkSet.lab)
              ? pseudobulkSet.lab.title
              : pseudobulkSet.lab}
          </span>
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
            {accessoryPseudobulkSet?.cell_annotation && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Cell Annotation
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <SampleAnnotatedSummary
                    summary={accessoryPseudobulkSet.cell_annotation}
                    terms={allSampleTerms}
                  />
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

PseudobulkSet.getAccessoryDataPaths = (items) => {
  return [
    {
      type: "PseudobulkSet",
      paths: items.map((item) => item["@id"]),
      fields: ["cell_annotation", "cell_type", "workflows"],
    },
  ];
};
