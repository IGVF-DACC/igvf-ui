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

const biomarkersColumns = [
  {
    id: "biomarker_id",
    title: "Biomarker",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>
          {source.name} {source.quantification}
        </LinkedIdAndStatus>
      );
    },
    sorter: (item) => item.name,
  },
  {
    id: "classification",
    title: "Classification",
  },
  {
    id: "synonyms",
    title: "Synonyms",
    display: ({ source }) =>
      source.synonyms ? source.synonyms.join(", ") : "",
    isSortable: false,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesCell source={source} />,
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given treatments.
 */
export default function BiomarkerTable({
  biomarkers,
  reportLink = null,
  reportLabel = null,
  title = "Biomarkers",
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
              data={biomarkers}
              columns={biomarkersColumns}
              pager={{}}
              keyProp="@id"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

BiomarkerTable.propTypes = {
  // Biomarkers to display
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to report of biomarkers; use with `reportLabel`
  reportLink: PropTypes.string,
  // Label for report link; use with `reportLink`
  reportLabel: PropTypes.string,
  // Title to display if not "Biomarkers"
  title: PropTypes.string,
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
