// components
import { DataAreaTitle } from "./data-area";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SortableGrid, { type SortableGridConfig } from "./sortable-grid";
// root
import { AnalysisStepVersionObject } from "../globals";

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
        console.log("source", source);
        if (source.software_versions?.length > 0) {
          return (
            <SeparatedList>
              {source.software_versions.map((version) => (
                <Link key={version["@id"]} href={version["@id"]}>
                  {version.name}
                </Link>
              ))}
            </SeparatedList>
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
