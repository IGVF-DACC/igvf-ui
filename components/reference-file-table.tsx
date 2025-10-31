// components
import { DataAreaTitle } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import SortableGrid from "./sortable-grid";
// root
import type { FileObject } from "../globals";

const columns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <div className="flex items-start gap-1">
        <FileAccessionAndDownload file={source} />
        <HostedFilePreview file={source} buttonSize="sm" />
      </div>
    ),
    sorter: (item) => item.accession,
  },
  {
    id: "summary",
    title: "Summary",
    isSortable: false,
  },
];

/**
 * Displays a table of reference files.
 *
 * @param files - Reference files to display.
 */
export function ReferenceFileTable({
  files,
  panelId = "reference-file-table",
}: {
  files: FileObject[];
  panelId?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>Reference File Details</DataAreaTitle>
      <SortableGrid data={files} columns={columns} keyProp="@id" pager={{}} />
    </>
  );
}
