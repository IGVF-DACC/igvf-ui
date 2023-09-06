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
            <AlternateAccessions
              alternateAccessions={file.alternate_accessions}
            />
          )}
        </SearchListItemMeta>
        <SearchListItemQuality item={file} />
        {(fileSet || seqspecOfFileLinks.length > 0) && (
          <SearchListItemSupplement>
            {fileSet && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  File Set
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <Link href={fileSet["@id"]}>{fileSet.summary}</Link>
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
            {file.seqspec_of?.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Seqspec Of
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <SeparatedList>
                    {file.seqspec_of.map((seqspecOfFile) => (
                      <Link href={seqspecOfFile} key={seqspecOfFile}>
                        {accessoryData[seqspecOfFile].accession}
                      </Link>
                    ))}
                  </SeparatedList>
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
      </SearchListItemMain>
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
  const seqspecOfPaths = items.reduce((pathAcc, item) => {
    return item.seqspec_of ? pathAcc.concat(item.seqspec_of) : pathAcc;
  }, []);
  const data = [
    {
      type: "File",
      paths: items.map((item) => item.file_set).filter(Boolean),
      fields: ["@id", "summary"],
    },
  ];
  if (seqspecOfPaths.length > 0) {
    data.push({
      type: "File",
      paths: seqspecOfPaths,
      fields: ["accession"],
    });
  }
  return data;
};
