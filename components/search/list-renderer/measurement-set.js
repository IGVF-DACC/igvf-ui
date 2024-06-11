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

export default function MeasurementSet({ item: measurementSet }) {
  // Collect the summary of the sample object in the measurement set if available. MeasurementSet
  // objects can have zero or one sample object, so we only need to check the first one.
  const sampleSummary = measurementSet.samples?.[0].summary || "";
  console.log("sample: ", measurementSet.samples);
  console.log("sampleSummary: ", sampleSummary);
  const isSupplementsVisible =
    measurementSet.alternate_accessions?.length > 0 || sampleSummary;

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
        </SearchListItemMeta>
        {isSupplementsVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions
              item={measurementSet}
            />
            {sampleSummary && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Sample Summary
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {sampleSummary}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={measurementSet} />
    </SearchListItemContent>
  );
}

MeasurementSet.propTypes = {
  // Single measurement set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
