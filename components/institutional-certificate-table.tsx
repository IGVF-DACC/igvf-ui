// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
// components
import { ControlledAccessIndicator } from "./controlled-access";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { DataUseLimitationStatus } from "./data-use-limitation-status";
import Link from "./link-no-prefetch";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";
// lib
import { type InstitutionalCertificateObject } from "../lib/data-use-limitation";
// root
import type { DatabaseObject, LabObject } from "../globals";

/**
 * Defines the columns for the institutional certificate table.
 */
const icColumns = [
  {
    id: "certificate_identifier",
    title: "Certificate Identifier",
    display: ({ source }: { source: InstitutionalCertificateObject }) => (
      <LinkedIdAndStatus item={source}>
        {source.certificate_identifier}
      </LinkedIdAndStatus>
    ),
  },
  {
    id: "data_use_limitation_summary",
    title: "Data Use Limitation",
    display: ({ source }: { source: InstitutionalCertificateObject }) => (
      <DataUseLimitationStatus summary={source.data_use_limitation_summary} />
    ),
  },
  {
    id: "controlled_access",
    title: "Controlled Access",
    display: ({ source }: { source: DatabaseObject }) => (
      <ControlledAccessIndicator item={source} />
    ),
    sorter: (item: InstitutionalCertificateObject): number =>
      item.controlled_access ? 0 : 1,
    hide: (items: InstitutionalCertificateObject[]): boolean =>
      // Hide the column if no items have controlled access set.
      items.filter((item) => item.controlled_access).length === 0,
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }: { source: InstitutionalCertificateObject }) => {
      const lab = source.lab as LabObject;
      return <Link href={lab["@id"]}>{lab.title}</Link>;
    },
    sorter: (item: InstitutionalCertificateObject) =>
      (item.lab as LabObject).title,
  },
];

/**
 * Displays a table of institutional certificates.
 * @param institutionalCertificates - The institutional certificates to display
 * @param title - The title of the table, or "Institutional Certificates" by default
 * @param panelId - The ID of the panel for the section directory
 */
export function InstitutionalCertificateTable({
  institutionalCertificates,
  title = "Institutional Certificates",
  panelId = "institutional-certificates",
  reportLink = "",
  reportLabel = "Report of institutional certificates that refer to this sample",
}: {
  institutionalCertificates: InstitutionalCertificateObject[];
  title?: string;
  panelId?: string;
  reportLink?: string;
  reportLabel?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={institutionalCertificates}
          columns={icColumns}
          keyProp="@id"
          pager={{}}
        />
      </div>
    </>
  );
}
