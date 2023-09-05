// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
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
  const seqSpecOfValue = Array.isArray(accessoryData)
    ? accessoryData.find((item) => item.seqspec_of === file.seqspec_of)
    : null;

  const seqSpecOfLinks = seqSpecOfValue
    ? Array.isArray(seqSpecOfValue.seqspec_file)
      ? seqSpecOfValue.seqspec_file.map((seqspec_file, index) => [
          <Link key={seqspec_file["@id"]} href={seqspec_file["@id"]}>
            {seqspec_file.accession}
          </Link>,
          index < seqSpecOfValue.seqspec_file.length - 1 && ", ",
        ])
      : [
          <Link
            key={seqSpecOfValue.seqspec_file["@id"]}
            href={seqSpecOfValue.seqspec_file["@id"]}
          >
            {seqSpecOfValue.seqspec_file.accession}
          </Link>,
        ]
    : [];

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
          {seqSpecOfLinks && (
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Seqspec of
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {seqSpecOfLinks}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          )}
        </SearchListItemSupplement>
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
  return [
    {
      type: "File",
      paths: items.map((item) => item.file_set).filter(Boolean),
      fields: ["@id", "summary"],
    },
    {
      type: "File",
      paths: items.map((item) => item.seqspec_of).filter(Boolean),
      fields: ["@id", "accession"],
    },
  ];
};
