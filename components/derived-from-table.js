// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import { AnnotatedValue } from "./annotated-value";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { DeprecatedFileFilterControl } from "./deprecated-files";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import Link from "./link-no-prefetch";
import SortableGrid from "./sortable-grid";
import Status from "./status";
// lib
import {
  computeFileDisplayData,
  resolveDeprecatedFileProps,
} from "../lib/deprecated-files";
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
 *
 * @param {Object} props
 * @param {Array} props.derivedFrom - Files to display
 * @param {string} [props.reportLink] - Optional link (brackets indicate optional)
 * @param {string} [props.reportLabel] - Optional label
 * @param {string} [props.title] - Optional title
 * @param {boolean} [props.isDeletedVisible] - Include deleted items
 * @param {string} [props.panelId] - Panel ID
 */
export default function DerivedFromTable({
  derivedFrom,
  reportLink = null,
  reportLabel = null,
  title = "Derived From",
  isDeletedVisible = false,
  panelId = "derived-from",
}) {
  // Local state for deprecated file visibility if not controlled externally via props
  const [deprecatedVisible, setDeprecatedVisible] = useState(false);

  // Filter out deprecated files if the user has not opted to include them.
  const localDeprecated = resolveDeprecatedFileProps({
    deprecatedVisible,
    setDeprecatedVisible,
  });

  const { visibleFiles, showDeprecatedToggle } = computeFileDisplayData(
    derivedFrom,
    localDeprecated
  );

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        <div className="align-center flex gap-1">
          {showDeprecatedToggle && (
            <DeprecatedFileFilterControl
              panelId={panelId}
              deprecatedData={localDeprecated}
            />
          )}
          {reportLink && reportLabel && (
            <DataAreaTitleLink
              href={reportLink}
              label={reportLabel}
              isDeletedVisible={isDeletedVisible}
              isArchivedVisible={localDeprecated.visible}
            >
              <TableCellsIcon className="h-4 w-4" />
            </DataAreaTitleLink>
          )}
        </div>
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid data={visibleFiles} columns={columns} keyProp="@id" />
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
