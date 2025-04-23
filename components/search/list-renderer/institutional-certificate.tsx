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
// components
import { ControlledAccessIndicator } from "../../controlled-access";
import { DataUseLimitationStatus } from "../../data-use-limitation-status";
// lib
import { type InstitutionalCertificateObject } from "../../../lib/data-use-limitation";
// root
import type { LabObject } from "../../../globals";

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
        <SearchListItemTitle>{item.summary}</SearchListItemTitle>
        <SearchListItemMeta>
          <span key="lab">{(item.lab as LabObject).title}</span>
        </SearchListItemMeta>
        <SearchListItemQuality item={item}>
          <ControlledAccessIndicator item={item} />
          <DataUseLimitationStatus summary={item.data_use_limitation_summary} />
        </SearchListItemQuality>
      </SearchListItemMain>
    </SearchListItemContent>
  );
}
