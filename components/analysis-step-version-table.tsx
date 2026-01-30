// components
import { DataAreaTitle } from "./data-area";
import Link from "./link-no-prefetch";
import LinkedIdAndStatusStack from "./linked-id-and-status-stack";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
// root
import type {
  AnalysisStepVersionObject,
  SoftwareVersionObject,
} from "../globals";

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
      display: ({ source }: { source: AnalysisStepVersionObject }) => {
        if (source.software_versions?.length > 0) {
          return (
            <LinkedIdAndStatusStack
              items={source.software_versions as SoftwareVersionObject[]}
            >
              {(item) => item.name}
            </LinkedIdAndStatusStack>
          );
        }
        return null;
      },
      isSortable: false,
    },
  ];

export function AnalysisStepVersionTable({
  analysisStepVersions,
  title = "Analysis Step Versions",
  panelId = "analysis-step-versions-table",
}: {
  analysisStepVersions: AnalysisStepVersionObject[];
  title?: string;
  panelId?: string;
}) {
  return (
    <>
      <DataAreaTitle id={panelId} secDirTitle={title}>
        {title}
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
