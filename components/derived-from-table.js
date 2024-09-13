// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { FileAccessionAndDownload } from "./file-download";
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
    display: ({ source }) => {
      return <FileAccessionAndDownload file={source} />;
    },
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
    sorter: (item) => item.content_type.toLowerCase(),
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
  derivedFromFileSets = [],
  reportLink = null,
  reportLabel = null,
  title = "Derived From",
}) {
  return (
    <>
      <DataAreaTitle>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <SortableGrid
        data={derivedFrom}
        columns={columns}
        meta={{ derivedFromFileSets }}
        pager={{}}
        keyProp="@id"
      />
    </>
  );
}

DerivedFromTable.propTypes = {
  // Files to display in the table
  derivedFrom: PropTypes.array.isRequired,
  // File sets of the files
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object),
  // Optional link to a report of the files
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Optional title to display if not "Derived From"
  title: PropTypes.string,
};
