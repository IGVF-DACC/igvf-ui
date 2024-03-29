// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components/search/list-renderer
import AlternateAccessions from "../../alternate-accessions";
import SeparatedList from "../../separated-list";
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function AnalysisSet({ item: analysisSet }) {
  const summary = analysisSet.summary;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={analysisSet} />
          {analysisSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>Analysis</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{analysisSet.lab.title}</div>
          {summary && <div key="summary">{summary}</div>}
          {analysisSet.alternate_accessions?.length > 0 && (
            <AlternateAccessions
              alternateAccessions={analysisSet.alternate_accessions}
            />
          )}
        </SearchListItemMeta>
        {analysisSet.input_file_sets?.length > 0 && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Input File Sets
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                <SeparatedList>
                  {analysisSet.input_file_sets.map((fileSet) => (
                    <Link href={fileSet["@id"]} key={fileSet["@id"]}>
                      {fileSet.accession}
                    </Link>
                  ))}
                </SeparatedList>
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={analysisSet} />
    </SearchListItemContent>
  );
}

AnalysisSet.propTypes = {
  // Single analysis set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
