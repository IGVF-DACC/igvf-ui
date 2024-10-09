// node_modules
import { AnimatePresence, motion } from "framer-motion";
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
import SortableGrid from "./sortable-grid";

/**
 * Columns for samples
 */
const sampleColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
      );
    },
  },
  {
    id: "type",
    title: "Type",
    display: ({ source, meta }) => {
      // Map the first @type to a human-readable collection title if available.
      const title = meta.collectionTitles
        ? meta.collectionTitles[source["@type"][0]]
        : "";
      return title || source["@type"][0];
    },
    sorter: (item) => item["@type"][0],
  },
  {
    id: "sample_terms",
    title: "Sample Terms",
    display: ({ source }) => {
      if (source.sample_terms?.length > 0) {
        const sortedTerms = _.sortBy(source.sample_terms, (term) =>
          term.term_name.toLowerCase()
        );
        return (
          <SeparatedList>
            {sortedTerms.map((terms) => (
              <Link href={terms["@id"]} key={terms["@id"]}>
                {terms.term_name}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
    isSortable: false,
  },
  {
    id: "disease_terms",
    title: "Disease Terms",
    display: ({ source }) => {
      if (source.disease_terms?.length > 0) {
        const sortedTerms = _.sortBy(source.disease_terms, (disease) =>
          disease.term_name.toLowerCase()
        );
        return (
          <SeparatedList>
            {sortedTerms.map((term) => (
              <Link href={term["@id"]} key={term["@id"]}>
                {term.term_name}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
    hide: (samples) => samples.every((sample) => !sample.disease_terms),
    isSortable: false,
  },
  {
    id: "summary",
    title: "Summary",
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given sample objects.
 */
export default function SampleTable({
  samples,
  reportLink = null,
  reportLabel = null,
  title = "Samples",
  pagePanels,
  pagePanelId,
}) {
  const isExpanded = pagePanels.isExpanded(pagePanelId);
  const { collectionTitles } = useContext(SessionContext);

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
              data={samples}
              columns={sampleColumns}
              keyProp="@id"
              meta={{ collectionTitles }}
              pager={{}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

SampleTable.propTypes = {
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same samples as this table
  reportLink: PropTypes.string,
  // Label for the report link
  reportLabel: PropTypes.string,
  // Title of the table if not "Samples"
  title: PropTypes.string,
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
