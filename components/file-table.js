// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataAreaTitle } from "./data-area";
import { DataGridContainer } from "./data-grid";
import { FileAccessionAndDownload } from "./file-download";
import { ButtonLink } from "./form-elements";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import TableCount from "./table-count";

const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => <FileAccessionAndDownload file={source} />,
  },
  {
    id: "file_format",
    title: "File Format",
  },
  {
    id: "content_type",
    title: "Content Type",
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
  },
  {
    id: "file_size",
    title: "File Size",
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => {
      return <Status status={source.status} />;
    },
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display a sortable table of the given files.
 */
export default function FileTable({ files, title = "Files", itemPath = "" }) {
  const gridRef = useRef(null);

  const reportLink = itemPath
    ? `/multireport/?type=File&file_set=${encodeURIComponent(itemPath)}`
    : "";

  return (
    <>
      <DataAreaTitle>
        <div className="flex items-end justify-between">
          {title}
          {reportLink && (
            <ButtonLink
              href={reportLink}
              size="sm"
              label="Report of files that have this item as their file set"
            >
              <TableCellsIcon className="h-4 w-4" />
            </ButtonLink>
          )}
        </div>
      </DataAreaTitle>
      <TableCount count={files.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid data={files} columns={filesColumns} keyProp="@id" />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

FileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table; can be a string or a React component
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  // Path to the page containing the file table; used for the report link
  itemPath: PropTypes.string,
};
