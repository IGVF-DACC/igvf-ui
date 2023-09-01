// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import AlternateAccessions from "../../alternate-accessions";
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function MeasurementSet({ item: measurementSet }) {
  // Collect the summaries of all samples in the measurement set and use the first one as the
  // representative sample summary.
  const sampleSummaries =
    measurementSet.samples?.length > 0
      ? measurementSet.samples.map((sample) => sample.summary)
      : [];
  const representativeSampleSummary =
    sampleSummaries.length > 0 ? sampleSummaries[0] : null;
  const hiddenSampleSummaryCount =
    sampleSummaries.length > 1 ? sampleSummaries.length - 1 : 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={measurementSet} />
          {measurementSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{measurementSet.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{measurementSet.lab.title}</div>
          {measurementSet.summary && (
            <div key="summary">{measurementSet.summary}</div>
          )}
          {measurementSet.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={measurementSet.alternate_accessions}
            />
          )}
          {representativeSampleSummary && (
            <div key="representative-sample-summary">
              {representativeSampleSummary}
              {hiddenSampleSummaryCount > 0 && (
                <i> ({hiddenSampleSummaryCount} more)</i>
              )}
            </div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={measurementSet} />
    </SearchListItemContent>
  );
}

MeasurementSet.propTypes = {
  // Single measurement set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
