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

/**
 * The relationship type exists along side the donor objects embedded related_donors objects, but
 * does not exist in the separately retrieved related donor objects. Find the embedded
 * related_donors object that matches the given retrieved related donor object.
 * @param {object} donor Retrieved donor object to find in embeddedDonors
 * @param {array} embeddedDonors related_donors objects including donor object and relationship_type
 * @returns {object} Embedded related_donors object corresponding to the related donor object
 */
function findMatchingEmbeddedDonor(donor, embeddedDonors) {
  return embeddedDonors.find(
    (embeddedDonor) => embeddedDonor.donor["@id"] === donor["@id"]
  );
}

const relatedDonorsColumns = [
  {
    id: "related_donor_id",
    title: "Donor",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
      );
    },
    sorter: (item) => item.accession,
  },
  {
    id: "relationship_type",
    title: "Relationship Type",
    display: ({ source, meta }) => {
      const matchingEmbeddedDonor = findMatchingEmbeddedDonor(
        source,
        meta.embeddedDonors
      );
      return matchingEmbeddedDonor?.relationship_type;
    },
    sorter: (relatedDonor, meta) => {
      const matchingEmbeddedDonor = findMatchingEmbeddedDonor(
        relatedDonor,
        meta.embeddedDonors
      );
      return matchingEmbeddedDonor?.relationship_type || "";
    },
  },
];

/**
 * Display a sortable table of the given donors.
 */
export default function RelatedDonorsTable({
  relatedDonors,
  embeddedDonors,
  title = "Related Donors",
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
              data={relatedDonors}
              columns={relatedDonorsColumns}
              meta={{ embeddedDonors }}
              pager={{}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

RelatedDonorsTable.propTypes = {
  // Related donors to display
  relatedDonors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Related donor objects embedded in the displayed donor object; includes relationship type
  embeddedDonors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title of the table if not "Related Donors"
  title: PropTypes.string,
  // Expandable panels to determine if this table should appear collapsed or expanded
  pagePanels: PropTypes.object.isRequired,
  // ID of the panel that contains this table, unique on the page
  pagePanelId: PropTypes.string.isRequired,
};
