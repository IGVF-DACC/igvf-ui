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

/**
 * Columns displayed in the software version table.
 */
const columns = [
  {
    id: "@id",
    title: "Page",
    isSortable: false,
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>
          {source.name || source["@id"]}
        </LinkedIdAndStatus>
      );
    },
  },
  {
    id: "version",
    title: "Version",
  },
  {
    id: "downloaded_url",
    title: "Download",
    display: ({ source }) => {
      return (
        <a href={source.downloaded_url} target="_blank" rel="noreferrer">
          {source.downloaded_url}
        </a>
      );
    },
  },
];

/**
 * Display the given software versions in a table,
 */
export default function SoftwareVersionTable({
  versions,
  reportLink = null,
  reportLabel = null,
  title = "Software Versions",
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
            <SortableGrid data={versions} columns={columns} pager={{}} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

SoftwareVersionTable.propTypes = {
  // versions to display in the table
  versions: PropTypes.array.isRequired,
  // Optional link to a report
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Title for the table if not "Software Versions"
  title: PropTypes.string,
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
