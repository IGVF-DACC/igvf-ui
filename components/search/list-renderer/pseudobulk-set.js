// node_modules
import _ from "lodash";
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
// lib
import { truncateText } from "../../../lib/general";

export default function PseudobulkSet({ item: pseudobulkSet }) {
  const samplesSummary =
    pseudobulkSet.samples?.length > 0
      ? _.sortBy(
          [...new Set(pseudobulkSet.samples.map((sample) => sample.summary))],
          (item) => item.toLowerCase()
        )
      : [];

  const isSupplementsVisible =
    pseudobulkSet.alternate_accessions ||
    pseudobulkSet.description ||
    pseudobulkSet.cell_type ||
    samplesSummary.length > 0;

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
};
