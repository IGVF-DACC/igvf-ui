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
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";

export default function PredictionSet({ item: predictionSet }) {
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

  const isSupplementsVisible =
    predictionSet.alternate_accessions ||
    fileContentType.length > 0 ||
    predictionSet.samples;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={predictionSet} />
          {predictionSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{predictionSet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{predictionSet.lab.title}</span>
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
            {predictionSet.samples && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Samples
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {sampleSummaries.map((summary) => (
                    <div key={summary}>{summary}</div>
                  ))}
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

PredictionSet.propTypes = {
  // Single prediction set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
