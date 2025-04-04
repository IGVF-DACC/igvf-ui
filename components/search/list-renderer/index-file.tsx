// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
import { useContext } from "react";
// components
import SessionContext from "../../session-context";
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
// root
import type {
  LabObject,
  FileObject,
  FileSetObject,
  CollectionTitles,
} from "../../../globals";

export default function IndexFile({ item: indexFile }: { item: FileObject }) {
  // During indexing, `file_set` can contain a path instead of the expected object.
  const isFileSetEmbedded = typeof indexFile.file_set === "object";

  const isSupplementVisible =
    isFileSetEmbedded || indexFile.alternate_accessions?.length > 0;

  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };
  let filesetTitle =
    collectionTitles?.[indexFile.file_set["@type"][0]] ||
    indexFile.file_set["@type"][0];
  filesetTitle = filesetTitle.slice(0, -1);

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={indexFile} />
          {indexFile.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{indexFile.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{(indexFile.lab as LabObject).title}</span>
        </SearchListItemMeta>
        {isSupplementVisible && (
          <SearchListItemSupplement>
            <SearchListItemSupplementAlternateAccessions item={indexFile} />
            {isFileSetEmbedded && (
              <SearchListItemSupplementSection>
                <SearchListItemSupplementLabel>
                  {filesetTitle}
                </SearchListItemSupplementLabel>
                <SearchListItemSupplementContent>
                  <Link href={indexFile.file_set["@id"]}>
                    {(indexFile.file_set as FileSetObject).summary}
                  </Link>
                </SearchListItemSupplementContent>
              </SearchListItemSupplementSection>
            )}
          </SearchListItemSupplement>
        )}
        <SearchListItemQuality item={indexFile} />
      </SearchListItemMain>
    </SearchListItemContent>
  );
}

IndexFile.propTypes = {
  // Single file search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
