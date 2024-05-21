// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";
import { AliasesCell } from "./table-cells";

const analysisStepColumns = [
  {
    id: "name",
    title: "Name",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.name}</LinkedIdAndStatus>
    ),
    sorter: (item) => item.title.toLowerCase(),
  },
  {
    id: "title",
    title: "Title",
    sorter: (item) => item.title.toLowerCase(),
  },
  {
    id: "step_label",
    title: "Step Label",
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
    isSortable: false,
  },
  {
    id: "input_content_types",
    title: "Input Content Types",
    display: ({ source }) => {
      const sortedTypes = _.sortBy(source.input_content_types, (type) =>
        type.toLowerCase()
      );
      return sortedTypes.join(", ");
    },
    isSortable: false,
  },
  {
    id: "output_content_types",
    title: "Output Content Types",
    display: ({ source }) => {
      const sortedTypes = _.sortBy(source.output_content_types, (type) =>
        type.toLowerCase()
      );
      return sortedTypes.join(", ");
    },
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given analysis steps. Optionally display a link to a report page of
 * the analysis steps in this table.
 */
export default function AnalysisStepTable({
  analysisSteps,
  reportLink = "",
  reportLabel = "",
  title = "Analysis Steps",
}) {
  return (
    <>
      <DataAreaTitle>
        {title}
        {reportLink && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <SortableGrid
        data={analysisSteps}
        columns={analysisStepColumns}
        keyProp="@id"
        pager={{}}
      />
    </>
  );
}

AnalysisStepTable.propTypes = {
  // Analysis Steps to display
  analysisSteps: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same file sets as this table
  reportLink: PropTypes.string,
  // Label for the report link
  reportLabel: PropTypes.string,
  // Title of the table if not "Analysis Steps"
  title: PropTypes.string,
};
