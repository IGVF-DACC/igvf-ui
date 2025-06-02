// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SortableGrid from "./sortable-grid";

const analysisStepVersionColumns = [
  {
    id: "@id",
    title: "Analysis Step Versions",
    display: ({ source }) => <Link href={source["@id"]}>{source["@id"]}</Link>,
  },
  {
    id: "software_versions",
    title: "Software Versions",
    display: ({ source }) => {
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
 * Display a sortable table of the given analysis step versions. Optionally display a link to a report page of
 * the analysis steps in this table.
 */
export function AnalysisStepVersionTable({
  analysisStepVersions,
  reportLink = "",
  reportLabel = "",
  title = "Analysis Step Versions",
  panelId = "analysis-step-version-table",
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

AnalysisStepVersionTable.propTypes = {
  // Analysis Step Versions to display
  analysisStepVersions: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same file sets as this table
  reportLink: PropTypes.string,
  // Label for the report link
  reportLabel: PropTypes.string,
  // Title of the table if not "Analysis Step Versions"
  title: PropTypes.string,
  // Unique ID for the panel
  panelId: PropTypes.string,
};
