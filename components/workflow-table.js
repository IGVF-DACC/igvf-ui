// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";
import { AliasesCell } from "./table-cells";

const columns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
    sorter: (item) => item.accession,
  },
  {
    id: "name",
    title: "Name",
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
    isSortable: false,
  },
  {
    id: "source_url",
    title: "Source URL",
    display: ({ source }) => (
      <a href={source.source_url} target="_blank" rel="noopener noreferrer">
        {source.source_url}
      </a>
    ),
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title || null,
    sorter: (item) => (item.lab?.title ? item.lab.title.toLowerCase() : ""),
  },
];

/**
 * Display the given workflows in a table.
 */
export default function WorkflowTable({
  workflows,
  reportLink = null,
  reportLabel = null,
  title = "Workflows",
  panelId = "workflows",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>
        {title}
        {reportLink && reportLabel && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={workflows}
          columns={columns}
          pager={{}}
          keyProp="@id"
        />
      </div>
    </>
  );
}

WorkflowTable.propTypes = {
  // Workflows to display in the table
  workflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Optional link to a report
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Optional title to display if not "Workflows"
  title: PropTypes.string,
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
