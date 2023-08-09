// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
  SearchListItemSupplement,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
} from "./search-list-item";

export default function File({ item: file }) {
  const titleElements = [file.file_format, file.content_type];
  const summary = file.summary;
  const fileSetAccession = file.file_set ? file.file_set.accession: "";
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={file} />
          {file.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{titleElements.join(" - ")}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{file.lab.title}</div>
          {summary && <div key="summary">{summary}</div>}
          </SearchListItemMeta>
        {"file_set" in file && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                File Set
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {fileSetAccession}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
      <SearchListItemQuality item={file} />
    </SearchListItemContent>
  );
}

File.propTypes = {
  // Single file search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
