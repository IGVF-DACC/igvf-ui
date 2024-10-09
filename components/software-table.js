// node_modules
import { AnimatePresence, motion } from "framer-motion";
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
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
  pagePanels,
  pagePanelId,
}) {
  const isExpanded = pagePanels.isExpanded(pagePanelId);

  return (
    <>
      <DataAreaTitle>
        <DataAreaTitle.Expander
          pagePanels={pagePanels}
          pagePanelId={pagePanelId}
          label={`${title} table`}
        >
          {title}
        </DataAreaTitle.Expander>
        {reportLink && reportLabel && isExpanded && (
          <DataAreaTitleLink href={reportLink} label={reportLabel}>
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        )}
      </DataAreaTitle>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="overflow-hidden"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            transition={standardAnimationTransition}
            variants={standardAnimationVariants}
          >
            <SortableGrid
              data={software}
              columns={columns}
              pager={{}}
              keyProp="@id"
            />
          </motion.div>
        )}
      </AnimatePresence>
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
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
