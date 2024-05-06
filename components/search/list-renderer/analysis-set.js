// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components/search/list-renderer
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
// components
import AlternateAccessions from "../../alternate-accessions";
import SeparatedList from "../../separated-list";

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
                <SeparatedList isCollapsible>
                  {analysisSet.input_file_sets.map((fileSet) => (
                    <Link key={fileSet["@id"]} href={fileSet["@id"]}>
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
