// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { AnimatePresence, motion } from "motion/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
import MarkdownSection from "./markdown-section";
// lib
import { getVisibleItemAuditLevels } from "../lib/audit";
import { toShishkebabCase } from "../lib/general";

/**
 * The following small components render the custom icons for each audit level.
 */
function ErrorIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-error-icon"
    >
      <path
        className="fill-white dark:fill-black"
        d="M19.7,15.5L12,2.2c-0.4-0.7-1.2-1.1-2-1.1S8.4,1.5,8,2.2L0.3,15.5c-0.4,0.7-0.4,1.6,0,2.3
	c0.4,0.7,1.2,1.2,2,1.2h15.4c0.8,0,1.6-0.4,2-1.2C20.1,17.1,20.1,16.2,19.7,15.5z"
      />
      <path
        d="M18.9,16L11.2,2.7c-0.5-0.9-1.9-0.9-2.4,0L1.1,16C0.6,16.9,1.3,18,2.3,18h15.4C18.7,18,19.4,16.9,18.9,16z M8.5,5.8
	C8.5,5,9.2,4.3,10,4.3s1.5,0.7,1.5,1.5v5c0,0.8-0.7,1.5-1.5,1.5s-1.5-0.7-1.5-1.5V5.8z M10,16.9c-0.8,0-1.5-0.7-1.5-1.5
	s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S10.8,16.9,10,16.9z"
      />
    </svg>
  );
}

ErrorIcon.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

function WarningIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-warning-icon"
    >
      <path
        className="fill-white dark:fill-black"
        d="M0.3,4.5L8,17.8c0.4,0.7,1.2,1.1,2,1.1s1.6-0.4,2-1.2l7.7-13.3c0.4-0.7,0.4-1.6,0-2.3c-0.4-0.7-1.2-1.2-2-1.2H2.3
	c-0.8,0-1.6,0.4-2,1.2C-0.1,2.9-0.1,3.8,0.3,4.5z"
      />
      <path
        d="M17.7,2H2.3C1.3,2,0.6,3.1,1.1,4l7.7,13.3c0.5,0.9,1.9,0.9,2.4,0L18.9,4C19.4,3.1,18.7,2,17.7,2z M8.5,4.4
	c0-0.8,0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5v5c0,0.8-0.7,1.5-1.5,1.5s-1.5-0.7-1.5-1.5V4.4z M10,15.5c-0.8,0-1.5-0.7-1.5-1.5
	s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S10.8,15.5,10,15.5z"
      />
    </svg>
  );
}

WarningIcon.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

function NotCompliantIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-not-compliant-icon"
    >
      <path
        className="fill-white dark:fill-black"
        d="M15.8,0H4.2C1.9,0,0,1.9,0,4.2v11.5C0,18.1,1.9,20,4.2,20h11.5c2.4,0,4.3-1.9,4.3-4.3V4.2C20,1.9,18.1,0,15.8,0z"
      />
      <path
        d="M15.8,2H4.2C3,2,2,3,2,4.2v11.5C2,17,3,18,4.2,18h11.5c1.2,0,2.3-1,2.3-2.3V4.2C18,3,17,2,15.8,2z M5.8,3.9h3.6
	c0.8,0,1.5,0.7,1.5,1.5s-0.7,1.5-1.5,1.5H5.8C5,6.9,4.3,6.2,4.3,5.4S5,3.9,5.8,3.9z M11.6,16.3H5.9c-0.8,0-1.5-0.7-1.5-1.5
	s0.7-1.5,1.5-1.5h5.7c0.8,0,1.5,0.7,1.5,1.5S12.4,16.3,11.6,16.3z M14.2,11.6C14.2,11.6,14.2,11.6,14.2,11.6l-8.3-0.1
	c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5l8.3,0.1c0.8,0,1.5,0.7,1.5,1.5C15.7,11,15,11.6,14.2,11.6z"
      />
    </svg>
  );
}

NotCompliantIcon.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

function InternalActionIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid="audit-internal-action-icon"
    >
      <circle className="fill-white dark:fill-black" cx="10" cy="10" r="10" />
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}

InternalActionIcon.propTypes = {
  // Tailwind CSS classes to add to the icon
  className: PropTypes.string.isRequired,
};

/**
 * Maps an audit level to an icon and color.
 */
export const auditMap = {
  ERROR: {
    Icon: ErrorIcon,
    color: "fill-audit-error",
    background: "bg-audit-error",
    humanReadable: "Error",
  },
  WARNING: {
    Icon: WarningIcon,
    color: "fill-audit-warning",
    background: "bg-audit-warning",
    humanReadable: "Warning",
  },
  NOT_COMPLIANT: {
    Icon: NotCompliantIcon,
    color: "fill-audit-not-compliant",
    background: "bg-audit-not-compliant",
    humanReadable: "Not Compliant",
  },
  INTERNAL_ACTION: {
    Icon: InternalActionIcon,
    color: "fill-audit-internal-action",
    background: "bg-audit-internal-action",
    humanReadable: "Internal Action",
  },
};

/**
 * Custom hook to allow components that display audits to manage the audit status button and
 * details without needing to know the audit implementation.
 * @returns {object} Audit status and functions
 */
export function useAudit() {
  const [isDetailOpen, setIsPanelOpen] = useState(false);

  function toggleDetailsOpen() {
    setIsPanelOpen(!isDetailOpen);
  }

  return {
    // states
    isDetailOpen,
    // functions
    toggleDetailsOpen,
  };
}

/**
 * Display the narrative text for an audit. We can have multiple narratives for a single audit
 * category.
 */
function AuditNarrative({ level, category, detail }) {
  return (
    <div
      data-testid={`audit-narrative-${toShishkebabCase(
        level
      )}-${toShishkebabCase(category)}`}
    >
      <MarkdownSection className="prose-p:text-sm ml-5">
        {detail}
      </MarkdownSection>
    </div>
  );
}

AuditNarrative.propTypes = {
  // Audit level, e.g. ERROR, WARNING, etc. this narrative belongs to
  level: PropTypes.string.isRequired,
  // Audit category this narrative belongs to
  category: PropTypes.string.isRequired,
  // Markdown text for the audit narrative
  detail: PropTypes.string.isRequired,
};

/**
 * Displays a single category of audits, e.g. "missing files". The user can expand the category to
 * see the details of each audit within the category.
 */
function AuditCategory({ level, category, categoryAudits, children }) {
  // True if the user has expanded this category
  const [isCategoryOpen, setOpenedCategories] = useState(false);
  const { humanReadable } = auditMap[level];

  return (
    <li>
      <button
        className="flex cursor-pointer items-center gap-1 text-sm font-semibold"
        onClick={() => setOpenedCategories(!isCategoryOpen)}
        aria-label={`${
          isCategoryOpen ? "Close" : "Open"
        } ${category} ${humanReadable} audit narratives`}
      >
        {isCategoryOpen ? (
          <MinusIcon className="h-4 w-4" />
        ) : (
          <PlusIcon className="h-4 w-4" />
        )}
        {category}
      </button>
      <AnimatePresence>
        {isCategoryOpen &&
          categoryAudits.map((audit, i) => {
            return (
              <motion.div
                key={i}
                className="overflow-hidden"
                initial="collapsed"
                animate="open"
                exit="collapsed"
                transition={standardAnimationTransition}
                variants={standardAnimationVariants}
              >
                {children(audit)}
              </motion.div>
            );
          })}
      </AnimatePresence>
    </li>
  );
}

AuditCategory.propTypes = {
  // Audit level, e.g. ERROR, WARNING, etc.
  level: PropTypes.string.isRequired,
  // Audit category to display, e.g. "missing files"
  category: PropTypes.string.isRequired,
  // Audits within this category
  categoryAudits: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      detail: PropTypes.string.isRequired,
    })
  ).isRequired,
};

/**
 * Displays the details for one level of audits, e.g. ERROR or NOT_COMPLIANT. It keeps track of the
 * audit categories the user has opened.
 */
function AuditLevel({ level, levelAudits, children }) {
  const { Icon, color, background, humanReadable } = auditMap[level];

  // Group the audits by category.
  const auditsByCategory = _.groupBy(levelAudits, "category");

  return (
    <li
      className={`border-data-border my-0.5 rounded-sm border`}
      data-testid={`audit-level-${toShishkebabCase(level)}`}
    >
      <h2
        className={`border-data-border flex items-center gap-1 rounded-t-sm border-b px-1 py-0.5 text-sm font-semibold ${background}`}
      >
        <Icon className={`h-4 w-4 ${color}`} />
        {humanReadable}
      </h2>
      <ul className="p-1">
        {Object.keys(auditsByCategory).map((category) => {
          const categoryAudits = auditsByCategory[category];
          return children({
            category,
            categoryAudits,
          });
        })}
      </ul>
    </li>
  );
}

AuditLevel.propTypes = {
  // Audit level, e.g. ERROR, WARNING, etc.
  level: PropTypes.string.isRequired,
  // Audits within this level
  levelAudits: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      detail: PropTypes.string.isRequired,
    })
  ).isRequired,
};

/**
 * Displays the details of an audit, including all audit levels. The user can open audit details,
 * and then can also open the audit narratives for each audit level.
 */
export function AuditDetail({ item, auditState, className = null }) {
  const { isAuthenticated } = useAuth0();

  // Get the item's audit levels visible at the current authentication level.
  const auditLevels = getVisibleItemAuditLevels(item, isAuthenticated);
  const hasAudits = auditLevels.length > 0;

  return (
    <AnimatePresence>
      {hasAudits && auditState.isDetailOpen && (
        <motion.div
          className="overflow-hidden"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          transition={standardAnimationTransition}
          variants={standardAnimationVariants}
          data-testid="audit-detail-panel"
        >
          <ul className={className}>
            {auditLevels.map((level) => {
              const levelAudits = item.audit[level];
              return (
                <AuditLevel key={level} level={level} levelAudits={levelAudits}>
                  {({ category, categoryAudits }) => (
                    <AuditCategory
                      key={category}
                      level={level}
                      category={category}
                      categoryAudits={categoryAudits}
                    >
                      {(audit) => (
                        <AuditNarrative
                          key={audit.detail}
                          level={level}
                          category={category}
                          detail={audit.detail}
                        />
                      )}
                    </AuditCategory>
                  )}
                </AuditLevel>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

AuditDetail.propTypes = {
  // Item with audits to display
  item: PropTypes.object.isRequired,
  auditState: PropTypes.shape({
    // True if the audit details are open
    isDetailOpen: PropTypes.bool.isRequired,
    // Function to toggle the audit details open or closed
    toggleDetailsOpen: PropTypes.func.isRequired,
  }).isRequired,
  // Tailwind CSS classes to add to the wrapper around the audit details
  className: PropTypes.string,
};

/**
 * Displays the audit status button for an item.
 */
export function AuditStatus({ item, auditState }) {
  const { isAuthenticated } = useAuth0();
  const itemAuditLevels = getVisibleItemAuditLevels(item, isAuthenticated);

  if (itemAuditLevels.length > 0) {
    // Make an array of the human-readable audit levels for screen readers.
    const auditLevelTexts = itemAuditLevels.map(
      (level) => auditMap[level].humanReadable
    );

    return (
      <button
        onClick={auditState.toggleDetailsOpen}
        className={`border-audit flex h-[22px] shrink cursor-pointer items-center rounded-full border px-1 ${
          auditState.isDetailOpen
            ? "bg-button-audit-open"
            : "bg-button-audit-closed"
        }`}
        aria-label={`${
          auditState.isDetailOpen ? "Opened" : "Closed"
        } audits for ${auditLevelTexts.join(", ")}`}
        data-testid="audit-status-button"
      >
        {itemAuditLevels.map((level) => {
          const Icon = auditMap[level].Icon;
          return (
            <Icon className={`h-4 w-4 ${auditMap[level].color}`} key={level} />
          );
        })}
      </button>
    );
  }

  // Item does not have audits.
  return null;
}

AuditStatus.propTypes = {
  // Item with audits to display
  item: PropTypes.object.isRequired,
  // Audit state from `useAudits`
  auditState: PropTypes.shape({
    // True if the audit panel is open
    isDetailOpen: PropTypes.bool.isRequired,
    // Function to toggle the audit panel open/closed
    toggleDetailsOpen: PropTypes.func.isRequired,
  }).isRequired,
};
