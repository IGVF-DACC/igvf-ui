// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SortableGrid from "./sortable-grid";
// lib
import { sortedSeparatedList } from "../lib/general";
// root
import { AnalysisStepVersionObject } from "../globals";

const analysisStepVersionColumns = [
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
    display: ({ source }) => {
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
 * @param [panelId] - ID of the panel containing the table
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
