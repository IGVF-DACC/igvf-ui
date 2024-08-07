// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
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
  SearchListItemSupplementAlternateAccessions,
  SearchListItemSupplementSection,
  SearchListItemSupplementLabel,
  SearchListItemSupplementContent,
} from "./search-list-item";
// components
import SeparatedList from "../../separated-list";

export default function File({ item: file, accessoryData = null }) {
  const titleElements = [
    file.file_format,
    file.content_summary || file.content_type,
    file.assembly,
    file.transcriptome_annotation,
    file.illumina_read_type,
  ].filter(Boolean);
  const fileSet = accessoryData?.[file.file_set];

  // Get the seqspec_of objects from the accessory data.
  let seqspecOfs = file.seqspec_of
    ? file.seqspec_of.map((seqspecOfFile) => accessoryData?.[seqspecOfFile])
    : [];
  seqspecOfs = seqspecOfs.filter(Boolean);

  const isSupplementVisible =
    file.content_summary ||
    fileSet ||
    seqspecOfs.length > 0 ||
    file.alternate_accessions?.length > 0;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={file} />
          {file.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{titleElements.join(" - ")}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{file.lab.title}</span>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={file} />
            {file.content_summary && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Content Summary
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  {file.content_summary}
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
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
            {seqspecOfs.length > 0 && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  Seqspec Of
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <SeparatedList isCollapsible>
                    {seqspecOfs.map((seqspecOf) => {
                      return (
                        <Link href={seqspecOf["@id"]} key={seqspecOf["@id"]}>
                          {seqspecOf.accession}
                        </Link>
                      );
                    })}
                  </SeparatedList>
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
        <SearchListItemQuality item={file} />
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
