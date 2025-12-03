// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { AnnotatedValue } from "./annotated-value";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import Link from "./link-no-prefetch";
import SortableGrid from "./sortable-grid";
import Status from "./status";
// lib
import { dataSize, truthyOrZero } from "../lib/general";

/**
 * Columns for derived from files.
 */
const columns = [
  {
    id: "@id",
    title: "Accession",
    display: ({ source }) => (
      <div className="flex items-start gap-1">
        <FileAccessionAndDownload file={source} />
        <HostedFilePreview file={source} buttonSize="sm" />
      </div>
    ),
  },
  {
    id: "file_set",
    title: "File Set",
    display: ({ source }) => {
      const fileSet = source.file_set;
      return <Link href={fileSet["@id"]}>{fileSet.accession}</Link>;
    },
    sorter: (item) => item.file_set.accession,
  },
  {
    id: "file_format",
    title: "File Format",
  },
  {
    id: "content_type",
    title: "Content Type",
    display: ({ source }) => {
      return source.content_type ? (
        <AnnotatedValue
          objectType={source["@type"][0]}
          propertyName="content_type"
        >
          {source.content_type}
        </AnnotatedValue>
      ) : null;
    },
    sorter: (item) => (item.content_type || "Z").toLowerCase(),
  },
  {
    id: "lab.title",
    title: "Lab",
    display: ({ source }) => `${source.lab.title}`,
  },
  {
    id: "file_size",
    title: "File Size",
    display: ({ source }) =>
      truthyOrZero(source.file_size) ? dataSize(source.file_size) : "",
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display the given files in a table, useful for pages displaying files derived from other files.
 */
export default function DerivedFromTable({
  derivedFrom,
  reportLink = null,
  reportLabel = null,
  title = "Derived From",
  isDeletedVisible = false,
  panelId = "derived-from",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink
            href={reportLink}
            label={reportLabel}
            isDeletedVisible={isDeletedVisible}
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={derivedFrom}
          columns={columns}
          pager={{}}
          keyProp="@id"
        />
      </div>
    </>
  );
}

DerivedFromTable.propTypes = {
  // Files to display in the table
  derivedFrom: PropTypes.array.isRequired,
  // Optional link to a report of the files
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Optional title to display if not "Derived From"
  title: PropTypes.string,
  // ID of the panel containing the table for the section directory
  panelId: PropTypes.string,
  // True to include deleted items in the linked report
  isDeletedVisible: PropTypes.bool,
};
