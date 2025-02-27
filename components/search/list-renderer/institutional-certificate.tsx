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
          {item.certificate_identifier}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {item.summary} {item.data_use_limitation_summary}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{(item.lab as LabObject).title}</span>
        </SearchListItemMeta>
        <SearchListItemQuality item={item} />
      </SearchListItemMain>
    </SearchListItemContent>
  );
}
