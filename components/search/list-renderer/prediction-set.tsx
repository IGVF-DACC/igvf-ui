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
import SeparatedList from "../../separated-list";
// lib
import { type PredictionSetObject } from "../../../lib/file-sets";
import { isEmbedded, isEmbeddedArray } from "../../../lib/types";
// root
import type { SoftwareObject } from "../../../globals";

/**
 * A subset of the `PseudobulkSetObject` fields that appears in accessory data for the pseudobulk
 * set list renderer.
 */
type PredictionSetSubset = Pick<
  PredictionSetObject,
  "@id" | "@type" | "cell_annotation" | "cell_type" | "software_versions"
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

  // Collect all software from software versions and deduplicate.
  const softwareVersions = isEmbeddedArray(
    accessoryPredictionSet?.software_versions
  )
    ? accessoryPredictionSet.software_versions
    : [];

  // Build a map of software by their @id to deduplicate entries.
  const softwareById = softwareVersions.reduce(
    (softwareMap, softwareVersion) => {
      return isEmbedded(softwareVersion.software)
        ? softwareMap.set(
            softwareVersion.software["@id"],
            softwareVersion.software
          )
        : softwareMap;
    },
    new Map<string, SoftwareObject>()
  );

  // Sort software by title case insensitively.
  const software = [...softwareById.values()].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );

  const isSupplementsVisible =
    predictionSet.alternate_accessions ||
    accessoryPredictionSet?.cell_annotation ||
    fileContentType.length > 0 ||
    sampleSummaries.length > 0 ||
    software.length > 0;

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
            {software.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Software
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <SeparatedList>
                    {software.map((softwareItem) => (
                      <AnnotatedItem
                        key={softwareItem["@id"]}
                        tooltipKey={softwareItem["@id"]}
                        annotation={softwareItem.description}
                      >
                        {softwareItem.title}
                      </AnnotatedItem>
                    ))}
                  </SeparatedList>
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
      fields: ["cell_annotation", "cell_type", "software_versions"],
    },
  ];
};
