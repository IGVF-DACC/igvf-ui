// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { useState } from "react";
// components
import { AnnotatedValue } from "./annotated-value";
import { BatchDownloadActuator } from "./batch-download";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import DataGrid, { DataGridContainer } from "./data-grid";
import { FileAccessionAndDownload } from "./file-download";
import { HostedFilePreview } from "./hosted-file-preview";
import Link from "./link-no-prefetch";
import Pager, { TablePagerContainer } from "./pager";
import { SeqspecDocumentLink } from "./seqspec-document";
import TableCount from "./table-count";
// lib
import { FileTableController } from "../lib/batch-download";
import type { Row, Cell, CellContentProps } from "../lib/data-grid";
import {
  extractSeqspecsForFile,
  fileGroupsToDataGridFormat,
  generateSequenceFileGroups,
  paginateSequenceFileGroups,
} from "../lib/files";
// root
import type { DocumentObject, FileObject, FileSetObject } from "../globals";

/**
 * The default maximum number of items in the table before the pager gets displayed.
 */
const MAX_ITEMS_PER_PAGE = 10;

/**
 * Metadata for the sequencing file table DataGrid objects.
 * @property seqspecFiles - seqspec file objects associated with sequence files in the table
 * @property seqspecDocuments - seqspec specification documents associated with the sequence files
 */
type TableMeta = {
  seqspecFiles: FileObject[];
  seqspecDocuments: DocumentObject[];
};

/**
 * Row definition for the columns to display in the sequencing file table, mostly for displaying
 * metadata about the sequencing files. Keep in sync with the `headerRow` definition below.
 */
const columnDisplayConfig: Cell[] = [
  {
    id: "accession",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return (
        <div className="h-full">
          <FileAccessionAndDownload file={file} />
          <HostedFilePreview file={file} buttonSize="sm" />
        </div>
      );
    },
  },
  {
    id: "content-type",
    content: ({ source }: CellContentProps) =>
      source.content_type && typeof source.content_type === "string" ? (
        <AnnotatedValue
          objectType={source["@type"][0]}
          propertyName="content_type"
        >
          {source.content_type}
        </AnnotatedValue>
      ) : null,
  },
  {
    id: "file-format",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.file_format}</>;
    },
  },
  {
    id: "sequencing-run",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.sequencing_run}</>;
    },
  },
  {
    id: "flowcell-id",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.flowcell_id}</>;
    },
  },
  {
    id: "lane",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.lane}</>;
    },
  },
  {
    id: "illumina-read-type",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.illumina_read_type}</>;
    },
  },
  {
    id: "index",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.index}</>;
    },
  },
  {
    id: "associated-seqspec",
    content: ({ source, meta }: CellContentProps) => {
      const file = source as FileObject;
      const tableMetadata = meta as TableMeta;

      return (
        <div className="flex flex-col gap-4">
          {file.seqspecs?.length > 0 && (
            <SeqspecFileCell
              file={file}
              seqspecFiles={tableMetadata.seqspecFiles}
            />
          )}
          {file.seqspec_document && (
            <SeqspecDocumentCell
              file={file}
              seqspecDocuments={tableMetadata.seqspecDocuments}
            />
          )}
        </div>
      );
    },
  },
  {
    id: "sequencing_platform",
    content: ({ source }) => {
      return (
        <Link href={source.sequencing_platform["@id"]}>
          {source.sequencing_platform.term_name}
        </Link>
      );
    },
  },
  {
    id: "file-size",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.file_size}</>;
    },
  },
  {
    id: "lab",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{typeof file.lab === "object" ? file.lab.title : file.lab}</>;
    },
  },
  {
    id: "upload-status",
    content: ({ source }: CellContentProps) => {
      const file = source as FileObject;
      return <>{file.upload_status}</>;
    },
  },
];

/**
 * Row definitions for the sequencing file table column headers. Keep in sync with the
 * `columnDisplayConfig` above.
 */
const headerRow: Row = {
  id: "header",
  cells: [
    { id: "accession", content: "Accession" },
    { id: "content-type", content: "Content Type" },
    { id: "file-format", content: "File Format" },
    { id: "sequencing-run", content: "Sequencing Run" },
    { id: "flowcell-id", content: "Flowcell ID" },
    { id: "lane", content: "Lane" },
    { id: "illumina-read-type", content: "Illumina Read Type" },
    { id: "index", content: "Index" },
    { id: "associated-seqspec", content: "Associated seqspec" },
    { id: "sequencing_platform", content: "Sequencing Platform" },
    { id: "file-size", content: "File Size" },
    { id: "lab", content: "Lab" },
    { id: "upload-status", content: "Upload Status" },
  ],
  RowComponent: HeaderRowComponent,
};

/**
 * DataGrid cell renderer for displaying a list of linked seqspec files.
 * @param file - File object to display seqspecs for; might have non-embedded seqspec files
 * @param seqspecFiles - seqspec file objects available among all files in the file set
 */
function SeqspecFileCell({
  file,
  seqspecFiles,
}: {
  file: FileObject;
  seqspecFiles: FileObject[];
}) {
  const matchingSeqspecs = extractSeqspecsForFile(file, seqspecFiles);
  if (matchingSeqspecs.length > 0) {
    return (
      <div>
        {matchingSeqspecs.map((matchingSeqspec) => (
          <div
            className="my-1.5 first:mt-0 last:mb-0"
            key={matchingSeqspec["@id"]}
          >
            <FileAccessionAndDownload file={matchingSeqspec} />
          </div>
        ))}
      </div>
    );
  }
}

/**
 * DataGrid cell renderer for displaying a linked seqspec document.
 * @param file - File object to display seqspec document for
 * @param seqspecDocuments - seqspec document objects available among all files in the file set
 */
function SeqspecDocumentCell({
  file,
  seqspecDocuments,
}: {
  file: FileObject;
  seqspecDocuments: DocumentObject[];
}) {
  const matchingSeqspecDocument = seqspecDocuments.find(
    (seqspecDocument) => file.seqspec_document === seqspecDocument["@id"]
  );
  if (matchingSeqspecDocument) {
    return <SeqspecDocumentLink seqspecDocument={matchingSeqspecDocument} />;
  }
}

/**
 * Component to render the header row cells of the sequencing file table.
 * @param rowId - Unique identifier for the row; comes from the `Row` `id` property
 */
function HeaderRowComponent({
  rowId,
  children,
}: {
  rowId: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="h-full bg-gray-200 p-2 text-left font-semibold dark:bg-gray-800"
      data-row-id={rowId}
    >
      {children}
    </div>
  );
}

/**
 * Adds shading to the row cells of alternate row groups in the sequencing file table.
 * @param rowId - Unique identifier for the row; comes from the `Row` `id` property
 */
function AlternateRowComponent({
  rowId,
  children,
}: {
  rowId: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div
        className="h-full bg-slate-100 p-2 dark:bg-slate-800"
        data-row-id={rowId}
      >
        {children}
      </div>
    </>
  );
}

/**
 * Display a sortable table of the given files, specifically for FileSet pages that include
 * sequencing files.
 * @param files - Files to display in the table
 * @param title - Title of the table
 * @param itemPath - Path to the item for the report link
 * @param itemPathProp - Property of the item path to use in the report link
 * @param isIlluminaReadType - True if the table displays files with Illumina read type
 * @param seqspecFiles - Sequence specification files associated with the table
 * @param seqspecDocuments - Sequence specification documents associated with the table
 * @param panelId - ID for the table panel for the section directory
 */
export default function SequencingFileTable({
  files,
  fileSet = null,
  title = "Files",
  itemPath = "",
  itemPathProp = "file_set.@id",
  isIlluminaReadType = null,
  seqspecFiles = [],
  seqspecDocuments = [],
  isDeletedVisible = false,
  panelId = "sequencing-files",
}: {
  files: FileObject[];
  fileSet?: FileSetObject;
  title?: string;
  itemPath?: string;
  itemPathProp?: string;
  isIlluminaReadType?: boolean | null;
  seqspecFiles?: FileObject[];
  seqspecDocuments?: DocumentObject[];
  isDeletedVisible?: boolean;
  panelId?: string;
}) {
  // Currently viewed page of sequence files
  const [pageIndex, setPageIndex] = useState(0);

  // True or false isIlluminaReadType adds a positive or negative `illumina_read_type` selector to
  // the report link. Undefined generates no `illumina_read_type` selector in the file query string.
  let illuminaSelector = "";
  if (isIlluminaReadType === true) {
    illuminaSelector = "&illumina_read_type=*";
  } else if (isIlluminaReadType === false) {
    illuminaSelector = "&illumina_read_type!=*";
  }

  // Generate the report link appropriate for the sequence file table's Illumina read type.
  const reportLink = itemPath
    ? `/multireport/?type=SequenceFile&${itemPathProp}=${encodeURIComponent(
        itemPath
      )}${illuminaSelector}`
    : "";

  // Leave out the "Illumina Read Type" column if `isIlluminaReadType` is false.
  const resolvedColumnDisplayConfig = isIlluminaReadType
    ? columnDisplayConfig
    : columnDisplayConfig.filter((col) => col.id !== "illumina-read-type");

  // Generate the sequence-file table data-grid format for the files.
  const sequenceFileGroups = generateSequenceFileGroups(files);
  const paginatedSequenceFileGroups = paginateSequenceFileGroups(
    sequenceFileGroups,
    MAX_ITEMS_PER_PAGE
  );
  const sequenceDataGrid = fileGroupsToDataGridFormat(
    paginatedSequenceFileGroups[pageIndex],
    resolvedColumnDisplayConfig,
    AlternateRowComponent
  );

  // Get the total number of files within `sequenceFileGroups`. This might have a different count
  // from `files.length` if some files were found invalid for a sequence file table.
  const totalFileCount = Array.from(sequenceFileGroups.values()).reduce(
    (count, files) => count + files.length,
    0
  );

  // Generate the header row either with or without the Illumina Read Type column, as selected.
  const resolvedHeaderRow = isIlluminaReadType
    ? headerRow
    : {
        ...headerRow,
        cells: headerRow.cells.filter(
          (cell) => cell.id !== "illumina-read-type"
        ),
      };

  // Create a batch-download controller if a file set is provided.
  const controller = fileSet ? new FileTableController(fileSet) : null;

  // Called when the user selects a new page of sequence files to view.
  function setCurrentPageIndex(newIndex: number) {
    setPageIndex(newIndex);
  }

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {(controller || reportLink) && (
          <div className="align-center flex gap-1">
            {controller && (
              <BatchDownloadActuator
                controller={controller}
                label="Download files associated with this file set"
                size="sm"
              />
            )}
            {reportLink && (
              <DataAreaTitleLink
                href={reportLink}
                label="Report of files that have this item as their file set"
                isDeletedVisible={isDeletedVisible}
              >
                <TableCellsIcon className="h-4 w-4" />
              </DataAreaTitleLink>
            )}
          </div>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <TableCount count={totalFileCount} />
        {paginatedSequenceFileGroups.length > 1 && (
          <TablePagerContainer>
            <Pager
              currentPage={pageIndex + 1}
              totalPages={paginatedSequenceFileGroups.length}
              onClick={(newCurrentPage) =>
                setCurrentPageIndex(newCurrentPage - 1)
              }
            />
          </TablePagerContainer>
        )}
        <DataGridContainer className="h-full">
          <DataGrid
            data={[resolvedHeaderRow, ...sequenceDataGrid]}
            meta={{ seqspecFiles, seqspecDocuments }}
          />
        </DataGridContainer>
      </div>
    </>
  );
}
