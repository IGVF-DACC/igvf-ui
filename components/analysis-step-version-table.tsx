// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SortableGrid from "./sortable-grid";
// root
import { AnalysisStepVersionObject } from "../globals";

const analysisStepVersionColumns = [
  {
    id: "@id",
    title: "Analysis Step Versions",
    display: ({ source }: { source: AnalysisStepVersionObject }) => (
      <Link href={source["@id"]}>{source["@id"]}</Link>
    ),
  },
  {
    id: "software_versions",
    title: "Software Versions",
    display: ({ source }: { source: AnalysisStepVersionObject }) => {
      return (
        <SeparatedList>
          {source.software_versions.map((version) => (
            <Link key={version["@id"]} href={version["@id"]}>
              {version.name}
            </Link>
          ))}
        </SeparatedList>
      );
    },
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given analysis step versions. Optionally display a link to a
 * report page of the analysis steps in this table.
 *
 * @param analysisStepVersions - Analysis Step Versions to display in the table
 * @param reportLink - Optional link to a report page containing the same file sets as this table
 * @param reportLabel - Label for the report link if given
 * @param title - Title of the table
 * @param panelId - Unique ID for the panel in the section directory
 */
export function AnalysisStepVersionTable({
  analysisStepVersions,
  reportLink = "",
  reportLabel = "",
  title = "Analysis Step Versions",
  panelId = "analysis-step-version-table",
}: {
  analysisStepVersions: AnalysisStepVersionObject[];
  reportLink?: string;
  reportLabel?: string;
  title?: string;
  panelId?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={analysisStepVersions}
          columns={analysisStepVersionColumns}
          keyProp="@id"
          pager={{}}
        />
      </div>
    </>
  );
}
