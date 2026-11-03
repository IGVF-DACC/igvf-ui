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
import { AnnotatedItem } from "../../annotated-value";
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";
import { SampleAnnotatedSummary } from "../../sample-annotated-summary";
// lib
import { type PredictionSetObject } from "../../../lib/file-sets";
import { isEmbedded } from "../../../lib/types";

export default function PredictionSet({
  item: predictionSet,
}: {
  item: PredictionSetObject;
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

  const cellType = isEmbedded(predictionSet.cell_type)
    ? predictionSet.cell_type
    : null;

  const isSupplementsVisible =
    predictionSet.alternate_accessions?.length > 0 ||
    predictionSet.cell_annotation ||
    cellType ||
    isEmbedded(predictionSet.software) ||
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
            {predictionSet.cell_annotation && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Cell Annotation
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <SampleAnnotatedSummary
                    summary={predictionSet.cell_annotation}
                    terms={[cellType]}
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
            {isEmbedded(predictionSet.software) && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Software
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <AnnotatedItem
                    tooltipKey={predictionSet.software["@id"]}
                    annotation={predictionSet.software.description}
                  >
                    {predictionSet.software.title}
                  </AnnotatedItem>
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
