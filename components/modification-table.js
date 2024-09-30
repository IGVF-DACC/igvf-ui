// node_modules
import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
import { DataAreaTitle } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";

const modificationsColumns = [
  {
    id: "summary",
    title: "Summary",
    display: ({ source }) => (
      <LinkedIdAndStatus item={source}>{source.summary}</LinkedIdAndStatus>
    ),
  },
  {
    id: "modality",
    title: "Modality",
  },
];

/**
 * Display a sortable table of the given modifications.
 */
export default function ModificationTable({
  modifications,
  title = "Modifications",
  pagePanels,
  pagePanelId,
}) {
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
      </DataAreaTitle>
      <AnimatePresence>
        {pagePanels.isExpanded(pagePanelId) && (
          <motion.div
            className="overflow-hidden"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            transition={standardAnimationTransition}
            variants={standardAnimationVariants}
          >
            <SortableGrid
              data={modifications}
              columns={modificationsColumns}
              keyProp="@id"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

ModificationTable.propTypes = {
  // Modifications to display
  modifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table if not "Modifications"
  title: PropTypes.string,
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
