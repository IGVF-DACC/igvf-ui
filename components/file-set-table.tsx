// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { useContext } from "react";
// root
import type {
  CollectionTitles,
  FileObject,
  FileSetObject,
  LabObject,
} from "../globals";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import LinkedIdAndStatus from "./linked-id-and-status";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
import { AliasesCell } from "./table-cells";
// lib
import { isFileObjectArray } from "../lib/files";

/**
 * Used to pass metadata to the sortable grid for file set table rendering. `options` comes from
 * FileSetTable props. `collectionTitles` comes from session context.
 */
interface FileSetMeta {
  options: {
    showFileSetFiles: boolean;
    fileFilter?: (files: FileObject[]) => FileObject[];
  } | null;
  collectionTitles: CollectionTitles;
}

/**
 * Columns configuration for the file set sortable grid.
 */
const fileSetColumns: SortableGridConfig<FileSetObject, FileSetMeta>[] = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
  },
  {
    id: "file_set_type",
    title: "File Set Type",
    sorter: (item) => item.file_set_type.toLowerCase(),
  },
  {
    id: "preferred_assay_titles",
    title: "Preferred Assay Titles",
    display: ({ source }) => {
      if (source.preferred_assay_titles?.length > 0) {
        const uniqueTitles = new Set(source.preferred_assay_titles);
        const sortedTitles = _.sortBy(Array.from(uniqueTitles), [
          (title) => title.toLowerCase(),
        ]);
        return <>{sortedTitles.join(", ")}</>;
      }
      return null;
    },
    isSortable: false,
  },
  {
    id: "files",
    title: "Files",
    display: ({ source, meta }) => {
      if (source.files && isFileObjectArray(source.files)) {
        const files = meta.options?.fileFilter
          ? meta.options.fileFilter(source.files)
          : source.files;
        return (
          <SeparatedList>
            {files.map((file) => (
              <Link key={file["@id"]} href={file["@id"]}>
                {file.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
    hide: (data, columns, meta) => {
      if (meta.options?.showFileSetFiles) {
        // Hide the column if the client didn't request it, or if they did but there are no files
        // to display after filtering, if the client provided a filter function.
        const allFiles = data.reduce<FileObject[]>((acc, fileSet) => {
          if (fileSet.files && isFileObjectArray(fileSet.files)) {
            return acc.concat(fileSet.files);
          }
          return acc;
        }, []);
        const filteredFiles = meta.options?.fileFilter
          ? meta.options.fileFilter(allFiles)
          : allFiles;
        return filteredFiles.length === 0;
      }
      return true;
    },
    isSortable: false,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => {
      if (source.lab && typeof source.lab === "object") {
        const lab = source.lab as LabObject;
        return <>{lab.title}</>;
      }
      return null;
    },
    sorter: (item) => {
      const lab = item.lab as LabObject | undefined;
      return lab?.title ? lab.title.toLowerCase() : "";
    },
  },
];

/**
 * Display a sortable table of the given file sets. Optionally display a link to a report page of
 * the file sets in this table. To allow this report link to work, the file sets in this table
 * must each include a link back to the currently displayed item.
 *
 * - fileSetType: `@type` of the file sets referring to the currently displayed item. The report page
 *   displays only objects of this type. You can use the `FileSet` abstract type if needed here.
 *
 * - identifierProp: Property of the report items that links back to the currently displayed item
 *
 * - itemIdentifier: ID of the currently displayed item that the report items link back to.
 *
 * You can optionally display a Files column in the table. Each cell of this column shows linked
 * accessions of files belonging to the file set displayed in that row. To show this column,
 * include the `fileSetMeta` property with the following properties:
 *
 * - showFileSetFiles: True to show the Files column
 *
 * - fileFilter: Optional function to filter the files to display in the Files column. This
 *   function takes an array of file objects displayed in the cell of the File column and returns
 *   an array of file objects to include in the cell. If you don't provide this function, the cell
 *   displays all files belonging to the file set in the row.
 *
 * @param fileSets - Array of file sets to display in the table
 * @param reportLink - Link to the report page containing the same file sets as this table
 * @param reportLabel - Label for the report link
 * @param title - Title of the table if not "File Sets"
 * @param fileSetMeta - Metadata for display options
 * @param isDeletedVisible - True to include deleted status in the linked report
 * @param panelId - ID of the panel for the section directory
 */
export default function FileSetTable({
  fileSets,
  reportLink = "",
  reportLabel = "",
  title = "File Sets",
  fileSetMeta = null,
  isDeletedVisible = false,
  panelId = "file-sets",
}: {
  fileSets: FileSetObject[];
  reportLink?: string;
  reportLabel?: string;
  title?: string;
  fileSetMeta?: {
    showFileSetFiles: boolean;
    fileFilter?: (files: FileObject[]) => FileObject[];
  } | null;
  isDeletedVisible?: boolean;
  panelId?: string;
}) {
  const { collectionTitles } = useContext(SessionContext);

  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && (
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
          data={fileSets}
          columns={fileSetColumns}
          keyProp="@id"
          meta={{ options: fileSetMeta, collectionTitles }}
        />
      </div>
    </>
  );
}
