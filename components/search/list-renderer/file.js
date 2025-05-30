// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
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
import { ExternallyHostedBadge } from "../../common-pill-badges";
import Link from "../../link-no-prefetch";
import SeparatedList from "../../separated-list";
import SessionContext from "../../session-context";

export default function File({ item: file, accessoryData = null }) {
  const titleElements = [
    file.file_format,
    file.content_summary || file.content_type,
    file.assembly,
    file.transcriptome_annotation,
    file.illumina_read_type,
  ].filter(Boolean);

  // During indexing, `file_set` can contain a path instead of the expected object.
  const isFileSetEmbedded = typeof file.file_set === "object";

  // Determine whether the file is externally hosted from the file object in accessory data.
  const isExternallyHosted =
    accessoryData?.[file["@id"]]?.externally_hosted ?? false;

  // Get the seqspec_of objects from the accessory data.
  let seqspecOfs = file.seqspec_of
    ? file.seqspec_of.map((seqspecOfFile) => accessoryData?.[seqspecOfFile])
    : [];
  seqspecOfs = seqspecOfs.filter(Boolean);

  const { collectionTitles } = useContext(SessionContext);

  const filesetTitle = isFileSetEmbedded
    ? (
        collectionTitles?.[file.file_set["@type"][0]] ||
        file.file_set["@type"][0]
      ).slice(0, -1)
    : "FILE SET";

  const isSupplementVisible =
    isFileSetEmbedded ||
    file.content_summary ||
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
            {isFileSetEmbedded && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  {filesetTitle}
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <Link href={file.file_set["@id"]}>
                    {file.file_set.summary}
                  </Link>
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
        <SearchListItemQuality item={file}>
          {isExternallyHosted && <ExternallyHostedBadge />}
        </SearchListItemQuality>
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
  // Get all search-result file `externally_hosted` properties.
  const files = [
    {
      type: "File",
      paths: items.map((item) => item["@id"]),
      fields: ["externally_hosted"],
    },
  ];

  // Get the `seqspec_of` for all files in the results.
  let seqspecOfPaths = items.reduce(
    (pathAcc, item) =>
      item.seqspec_of ? pathAcc.concat(item.seqspec_of) : pathAcc,
    []
  );
  seqspecOfPaths = [...new Set(seqspecOfPaths)];
  const seqspecOf =
    seqspecOfPaths.length > 0
      ? [{ type: "File", paths: seqspecOfPaths, fields: ["accession"] }]
      : [];

  return files.concat(seqspecOf);
};
