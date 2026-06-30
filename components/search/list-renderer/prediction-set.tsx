// node_modules
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
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";
import { SampleAnnotatedSummary } from "../../sample-annotated-summary";
// lib
import { type PredictionSetObject } from "../../../lib/file-sets";
import { isEmbedded } from "../../../lib/types";

/**
 * A subset of the `PseudobulkSetObject` fields that appears in accessory data for the pseudobulk
 * set list renderer.
 */
type PredictionSetSubset = Pick<
  PredictionSetObject,
  "@id" | "@type" | "cell_annotation" | "cell_type"
>;

export default function PredictionSet({
  item: predictionSet,
  accessoryData,
}: {
  item: PredictionSetObject;
  accessoryData?: Record<string, PredictionSetSubset> | null;
}) {
  // Collect all files.content_type and deduplicate
  const fileContentType =
    predictionSet.files?.length > 0
      ? [
          ...new Set(predictionSet.files.map((file) => file.content_type)),
        ].sort()
      : [];
  const sampleSummaries =
    predictionSet.samples?.length > 0
      ? [
          ...new Set(predictionSet.samples.map((sample) => sample.summary)),
        ].sort()
      : [];

  // If the accessory data has a `cell_type` property, use it to get definitions for tooltips on
  // `cell_annotation` summary. We eventually need to also retrieve sample terms to get more
  // complete tooltips.
  const accessoryPredictionSet = accessoryData?.[predictionSet["@id"]];
  const allSampleTerms = isEmbedded(accessoryPredictionSet?.cell_type)
    ? [accessoryPredictionSet.cell_type]
    : [];

  const isSupplementsVisible =
    predictionSet.alternate_accessions ||
    accessoryPredictionSet?.cell_annotation ||
    fileContentType.length > 0 ||
    sampleSummaries.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={predictionSet} />
          {predictionSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{predictionSet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">
            {isEmbedded(predictionSet.lab)
              ? predictionSet.lab.title
              : predictionSet.lab}
          </span>
          {predictionSet.scope && (
            <span key="scope">{predictionSet.scope}</span>
          )}
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={predictionSet} />
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
            {accessoryPredictionSet?.cell_annotation && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Cell Annotation
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <SampleAnnotatedSummary
                    summary={accessoryPredictionSet.cell_annotation}
                    terms={allSampleTerms}
                  />
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
            {sampleSummaries.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Samples
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {sampleSummaries.join(", ")}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={predictionSet}>
        <ControlledAccessIndicator item={predictionSet} />
        <DataUseLimitationSummaries
          summaries={predictionSet.data_use_limitation_summaries}
        />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

PredictionSet.getAccessoryDataPaths = (items) => {
  return [
    {
      type: "PredictionSet",
      paths: items.map((item) => item["@id"]),
      fields: ["cell_annotation", "cell_type"],
    },
  ];
};
