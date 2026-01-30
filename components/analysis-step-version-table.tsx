// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import LinkedIdAndStatusStack from "./linked-id-and-status-stack";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
// lib
import { isMinimalSoftwareVersionObjectArray } from "../lib/software-version";
// root
import type { AnalysisStepVersionObject } from "../globals";

/**
 * Columns configuration for the Analysis Step Version table.
 */
const analysisStepVersionColumns: SortableGridConfig<AnalysisStepVersionObject>[] =
  [
    {
      id: "analysis_step_version",
      title: "Analysis Step Version",
      display: ({ source }) => (
        <Link href={source["@id"]}>{source["@id"]}</Link>
      ),
      sorter: (item) => item["@id"],
    },
    {
      id: "software_versions",
      title: "Software Versions",
      display: ({ source }) => {
        if (
          source.software_versions?.length > 0 &&
          isMinimalSoftwareVersionObjectArray(source.software_versions)
        ) {
          return (
            <LinkedIdAndStatusStack items={source.software_versions}>
              {(item) => item.name}
            </LinkedIdAndStatusStack>
          );
        }
        return null;
      },
      isSortable: false,
    },
  ];

/**
 * Display a table of Analysis Step Versions.
 *
 * @param analysisStepVersions - List of Analysis Step Version objects to display
 * @param title - Title of the data area
 * @param reportLink - Link to multi-report for analysis step versions
 * @param reportLabel - Label for the multi-report link
 * @param isDeletedVisible - True to show deleted items in the report link
 * @param panelId - ID of the data area panel
 */
export function AnalysisStepVersionTable({
  analysisStepVersions,
  title = "Analysis Step Versions",
  reportLink = "",
  reportLabel = "",
  isDeletedVisible = false,
  panelId = "analysis-step-versions-table",
}: {
  analysisStepVersions: AnalysisStepVersionObject[];
  title?: string;
  reportLink?: string;
  reportLabel?: string;
  isDeletedVisible?: boolean;
  panelId?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId} secDirTitle={title}>
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
          data={analysisStepVersions}
          columns={analysisStepVersionColumns}
          keyProp="@id"
        />
      </div>
    </>
  );
}
