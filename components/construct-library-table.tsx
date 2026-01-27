// components
import { DataAreaTitle } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import LinkedIdAndStatusStack from "./linked-id-and-status-stack";
import SortableGrid from "./sortable-grid";
// root
import { FileSetObject } from "../globals.d";

/**
 * Define the columns for the construct library table.
 */
const columns = [
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
    display: ({ source }) => {
      if (source.integrated_content_files) {
        return (
          <LinkedIdAndStatusStack items={source.integrated_content_files}>
            {(file) => file.accession}
          </LinkedIdAndStatusStack>
        );
      }
    },
    isSortable: false,
  },
];

/**
 * Displays the given construct library sets in a sortable grid. This table is specific to
 * associated construct library sets you can find in the `construct_library_sets` property of file
 * set objects.
 * @param constructLibrarySets - The construct library sets to display in the table
 * @param title - The title of the table
 * @param panelId - The ID of the panel containing the table
 */
export function ConstructLibraryTable({
  constructLibrarySets,
  title = "Construct Library Sets",
  panelId = "construct-library-sets",
}: {
  constructLibrarySets: FileSetObject[];
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
          keyProp="@id"
        />
      </div>
    </>
  );
}
