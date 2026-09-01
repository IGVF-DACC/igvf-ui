// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
// root
import type { SoftwareVersionObject } from "../globals";

/**
 * Columns displayed in the software version table.
 */
const columns: SortableGridConfig<SoftwareVersionObject>[] = [
  {
    id: "@id",
    title: "Page",
    isSortable: false,
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>
          {source.name || source["@id"]}
        </LinkedIdAndStatus>
      );
    },
  },
  {
    id: "version",
    title: "Version",
  },
  {
    id: "source_url",
    title: "Download",
    display: ({ source }) => {
      return (
        <a href={source.source_url} target="_blank" rel="noreferrer">
          {source.source_url}
        </a>
      );
    },
  },
];

/**
 * Display the given software versions in a table.
 *
 * @property versions - Array of software version objects to display in the table
 * @property reportLink - Optional link to a report
 * @property reportLabel - Optional label for the report link
 * @property title - Title for the table if not "Software Versions"
 * @property panelId - ID of the panel for the section directory
 */
export default function SoftwareVersionTable({
  versions,
  reportLink,
  reportLabel,
  title = "Software Versions",
  secDirTitle = "Software Versions",
  panelId = "software-versions",
}: {
  versions: SoftwareVersionObject[];
  reportLink?: string;
  reportLabel?: string;
  title?: string;
  panelId?: string;
  secDirTitle?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId} secDirTitle={secDirTitle}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid data={versions} columns={columns} />
      </div>
    </>
  );
}
