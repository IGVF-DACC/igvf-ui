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
    id: "accession",
    title: "Accession",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
    sorter: (item) => item.accession,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
    isSortable: false,
  },
  {
    id: "sex",
    title: "Sex",
  },
  {
    id: "taxa",
    title: "Taxa",
  },
];

/**
 * Display the given donors in a table.
 */
export default function DonorTable({
  donors,
  reportLink = null,
  reportLabel = null,
  title = "Donors",
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
            id={pagePanelId}
            className="overflow-hidden"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            transition={standardAnimationTransition}
            variants={standardAnimationVariants}
          >
            <SortableGrid
              data={donors}
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

DonorTable.propTypes = {
  // Donors to display in the table
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Optional link to a report
  reportLink: PropTypes.string,
  // Optional label for the report link
  reportLabel: PropTypes.string,
  // Optional title to display if not "Donors"
  title: PropTypes.string,
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
