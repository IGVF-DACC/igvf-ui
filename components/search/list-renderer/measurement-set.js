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
import { ExternallyHostedBadge } from "../../common-pill-badges";
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationSummaries } from "../../data-use-limitation-status";
// lib
import { collectDataUseLimitationSummariesFromSamples } from "../../../lib/data-use-limitation";

export default function MeasurementSet({
  item: measurementSet,
  accessoryData = null,
}) {
  // Collect the summary of the sample object in the measurement set if available. MeasurementSet
  // objects can have zero or one sample object, so we only need to check the first one.
  const sampleSummary = measurementSet.samples[0].summary;
  const isExternallyHosted =
    accessoryData?.[measurementSet["@id"]].externally_hosted ?? false;
  const isSupplementsVisible =
    measurementSet.alternate_accessions?.length > 0 || sampleSummary;

  const dulSummaries = collectDataUseLimitationSummariesFromSamples(
    measurementSet.samples
  );

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
      <SearchListItemQuality item={measurementSet}>
        {isExternallyHosted && <ExternallyHostedBadge />}
        <ControlledAccessIndicator item={measurementSet} />
        <DataUseLimitationSummaries summaries={dulSummaries} />
      </SearchListItemQuality>
    </SearchListItemContent>
  );
}

MeasurementSet.propTypes = {
  // Single measurement set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

MeasurementSet.getAccessoryDataPaths = (items) => {
  // Get the displayed measurement-set objects to get their `externally_hosted` properties.
  return [
    {
      type: "MeasurementSet",
      paths: items.map((item) => item["@id"]),
      fields: ["externally_hosted"],
    },
  ];
};
