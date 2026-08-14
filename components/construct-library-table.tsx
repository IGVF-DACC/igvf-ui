// components
import { DataAreaTitle } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import LinkedIdAndStatusStack from "./linked-id-and-status-stack";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
// lib
import { filterDatabaseObjectsByReferences } from "../lib/database-object";
import { type ConstructLibrarySetObject } from "../lib/file-sets";
import type { FileObject } from "../globals";

/**
 * Metadata for the construct library table.
 *
 * @property libraryDesignFiles - Library design files associated with the construct library sets.
 *                                These are used to display the "Library Design Files" column in
 *                                the Construct Library Sets table.
 */
type TableMeta = {
  libraryDesignFiles: FileObject[];
};

/**
 * Define the columns for the construct library table.
 */
const columns: SortableGridConfig<ConstructLibrarySetObject, TableMeta>[] = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
  },
  {
    id: "summary",
    title: "Summary",
    isSortable: false,
  },
  {
    id: "library-design-files",
    title: "Library Design Files",
    display: ({ source, meta }) => {
      // Get the library design file objects associated with the construct library set.
      const libraryDesignFiles = filterDatabaseObjectsByReferences(
        source.integrated_content_files,
        meta.libraryDesignFiles
      );
      if (libraryDesignFiles.length === 0) {
        return null;
      }

      return (
        <LinkedIdAndStatusStack items={libraryDesignFiles}>
          {(file) => file.accession}
        </LinkedIdAndStatusStack>
      );
    },
    hide: (data) => {
      // Hide the column if none of the construct library sets have associated library design files.
      const hasLibraryDesignFiles = data.some(
        (cls) => cls.integrated_content_files?.length > 0
      );
      return !hasLibraryDesignFiles;
    },
    isSortable: false,
  },
];

/**
 * Displays the given construct library sets in a sortable grid. This table is specific to
 * associated construct library sets you can find in the `construct_library_sets` property of file
 * set objects.
 * @param constructLibrarySets - Construct library sets to display in the table
 * @param libraryDesignFiles - Library design files associated with the construct library sets
 * @param title - The title of the table
 * @param panelId - The ID of the panel containing the table
 */
export function ConstructLibraryTable({
  constructLibrarySets,
  libraryDesignFiles,
  title = "Construct Library Sets",
  panelId = "construct-library-sets",
}: {
  constructLibrarySets: ConstructLibrarySetObject[];
  libraryDesignFiles?: FileObject[];
  title?: string;
  panelId?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>{title}</DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={constructLibrarySets}
          columns={columns}
          meta={{ libraryDesignFiles: libraryDesignFiles ?? [] }}
          keyProp="@id"
        />
      </div>
    </>
  );
}
