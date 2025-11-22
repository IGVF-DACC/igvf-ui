// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { useState } from "react";
// components
import Checkbox from "./checkbox";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SortableGrid from "./sortable-grid";
// lib
import { sortedSeparatedList } from "../lib/general";
// root
import { AnalysisStepVersionObject } from "../globals";

/**
 * Meta information passed to the sortable grid for the analysis step version table.
 *
 * @property isVersionColumnVisible - True to show the analysis step version column
 */
type TableMeta = {
  isVersionColumnVisible: boolean;
};

const analysisStepVersionColumns = [
  {
    id: "analysis_step_version",
    title: "Analysis Step Version",
    display: ({ source }) => {
      return <Link href={source["@id"]}>{source["@id"]}</Link>;
    },
    hide: (data, columns, meta: TableMeta) => !meta.isVersionColumnVisible,
    isSortable: false,
  },
  {
    id: "analysis_step_title",
    title: "Analysis Step Title",
    display: ({ source }) => _.get(source, "analysis_step.title", ""),
    sorter: (item) => _.get(item, "analysis_step.title", "").toLowerCase(),
  },
  {
    id: "analysis_step_type",
    title: "Analysis Step Types",
    display: ({ source }) => {
      const types = _.get(source, "analysis_step.analysis_step_types", []);
      return types.length > 0 ? sortedSeparatedList(types) : "";
    },
    isSortable: false,
  },
  {
    id: "analysis_step_input_content_types",
    title: "Input Content Types",
    display: ({ source }) => {
      const inputTypes = _.get(source, "analysis_step.input_content_types", []);
      return inputTypes.length > 0 ? sortedSeparatedList(inputTypes) : "";
    },
    isSortable: false,
  },
  {
    id: "analysis_step_output_content_types",
    title: "Output Content Types",
    display: ({ source }) => {
      const outputTypes = _.get(
        source,
        "analysis_step.output_content_types",
        []
      );
      return outputTypes.length > 0 ? sortedSeparatedList(outputTypes) : "";
    },
    isSortable: false,
  },
  {
    id: "software_versions",
    title: "Software Versions",
    display: ({ source }: { source: AnalysisStepVersionObject }) => {
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
    },
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given analysis step versions. Optionally display a link to a
 * report page of the analysis steps in this table.
 *
 * @param analysisStepVersions - Analysis step versions to display in the table
 * @param [reportLink] - Link to a report page containing the same analysis step versions
 * @param [reportLabel] - Label for the report link
 * @param [title] - Title of the table
 * @param [isDeletedVisible] - True to include deleted items in the linked report
 * @param [panelId] - ID of the panel containing the table
 */
export function AnalysisStepVersionTable({
  analysisStepVersions,
  reportLink = "",
  reportLabel = "",
  title = "Analysis Steps",
  isDeletedVisible = false,
  panelId = "analysis-step-version-table",
}: {
  analysisStepVersions: AnalysisStepVersionObject[];
  reportLink?: string;
  reportLabel?: string;
  title?: string;
  isDeletedVisible?: boolean;
  panelId?: string;
}) {
  const [isVersionColumnVisible, setIsVersionColumnVisible] = useState(false);

  return (
    <>
      <DataAreaTitle id={panelId} secDirTitle={title}>
        {title}
        <div className="flex gap-1">
          <Checkbox
            id="show-analysis-step-versions-column"
            checked={isVersionColumnVisible}
            name="Show analysis-step-versions column"
            onClick={() => setIsVersionColumnVisible(!isVersionColumnVisible)}
            className="items-center [&>input]:mr-0"
          >
            <div className="order-first mr-1 text-sm">
              Show analysis-step-versions column
            </div>
          </Checkbox>
          {reportLink && (
            <DataAreaTitleLink
              href={reportLink}
              label={reportLabel}
              isDeletedVisible={isDeletedVisible}
            >
              <TableCellsIcon className="h-4 w-4" />
            </DataAreaTitleLink>
          )}
        </div>
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={analysisStepVersions}
          columns={analysisStepVersionColumns}
          keyProp="@id"
          pager={{}}
          meta={{ isVersionColumnVisible } satisfies TableMeta}
        />
      </div>
    </>
  );
}
