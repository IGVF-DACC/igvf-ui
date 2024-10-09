// node_modules
import { AnimatePresence, motion } from "framer-motion";
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
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
        {reportLink && isExpanded && (
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
              data={analysisSteps}
              columns={analysisStepColumns}
              keyProp="@id"
              pager={{}}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
