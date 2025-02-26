// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// root
import type {
  DatabaseObject,
  InstitutionalCertificateObject,
  LabObject,
} from "../../../globals.d";

export default function InstitutionalCertificate({
  item,
}: {
  item: InstitutionalCertificateObject;
}) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={item} />
          {item.uuid}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{item.certificate_identifier}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{(item.lab as LabObject).title}</span>
        </SearchListItemMeta>
        <SearchListItemQuality item={item} />
      </SearchListItemMain>
    </SearchListItemContent>
  );
}
