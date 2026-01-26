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
    id: "name",
    title: "Name",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.name}</LinkedIdAndStatus>
    ),
  },
  {
    id: "title",
    title: "Title",
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
  {
    id: "description",
    title: "Description",
    isSortable: false,
  },
];

/**
 * Display the given software objects in a table.
 */
export default function SoftwareTable({
  software,
  reportLink = null,
  reportLabel = null,
  title = "Software",
  panelId = "software",
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
        <SortableGrid data={software} columns={columns} keyProp="@id" />
      </div>
    </>
  );
}

SoftwareTable.propTypes = {
  // Software to display in the table
  software: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Optional link to a report
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Optional title to display if not "Software"
  title: PropTypes.string,
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
