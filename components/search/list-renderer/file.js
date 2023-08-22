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

export default function File({ item: file, accessoryData = null }) {
  const titleElements = [
    file.file_format,
    file.content_summary || file.content_type,
    file.assembly,
    file.transcriptome_annotation,
    file.illumina_read_type,
  ].filter(Boolean);
  const summary = file.summary;
  const fileSet = accessoryData?.[file.file_set];

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
          {file.dbxrefs && (
            <div key="external resources">{file.dbxrefs.join(", ")}</div>
          )}
          {file.alternate_accessions?.length > 0 && (
            <div key="alternate_accessions">
              Alternate Accessions: {file.alternate_accessions.join(", ")}
            </div>
          )}
        </SearchListItemMeta>
        {fileSet && (
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                File Set
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {fileSet.summary}
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
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

File.getAccessoryDataPaths = (items) => {
  return [
    {
      type: "File",
      paths: items.map((item) => item.file_set).filter(Boolean),
      fields: ["summary"],
    },
  ];
};
