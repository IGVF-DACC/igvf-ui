// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
import Icon from "./icon";

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
    humanReadable: "Error",
  },
  WARNING: {
    Icon: WarningIcon,
    color: "fill-audit-warning",
    humanReadable: "Warning",
  },
  NOT_COMPLIANT: {
    Icon: NotCompliantIcon,
    color: "fill-audit-not-compliant",
    humanReadable: "Not Compliant",
  },
  INTERNAL_ACTION: {
    Icon: InternalActionIcon,
    color: "fill-audit-internal-action",
    humanReadable: "Internal Action",
  },
};

/**
 * For convenience, a list of all audit levels.
 */
const allLevels = Object.keys(auditMap);

/**
 * List of audit levels viewable without authentication.
 */
const publicLevels = allLevels.filter((level) => level !== "INTERNAL_ACTION");

// Regex to find a simplified markdown in the form "{link text|path}"
const markdownRegex = /{(.+?)\|(.+?)}/g;

/**
 * Display the audit narrative with embedded links. This gets displayed in each row of the audit
 * details. Links, if they exist in the `narrative` text, must be formatted in this form:
 * {link text|URI}
 */
function NarrativeWithLinks({ narrative }) {
  let linkMatches = markdownRegex.exec(narrative);
  if (linkMatches) {
    // `narrative` has at least one "markdown" sequence, so treat the whole thing as marked-down
    // text. Each loop iteration finds each markdown sequence. That gets broken into the non-link
    // text before the link and then the link itself.
    const renderedDetail = [];
    let segmentIndex = 0;
    while (linkMatches) {
      const linkText = linkMatches[1];
      const linkPath = linkMatches[2];
      const preText = narrative.substring(segmentIndex, linkMatches.index);
      renderedDetail.push(
        preText ? <span key={segmentIndex}>{preText}</span> : null,
        <Link href={linkPath} key={linkMatches.index}>
          {linkText}
        </Link>
      );
      segmentIndex = linkMatches.index + linkMatches[0].length;
      linkMatches = markdownRegex.exec(narrative);
    }

    // Lastly, render any non-link text after the last link.
    const postText = narrative.substring(segmentIndex, narrative.length);
    return renderedDetail.concat(
      postText ? <span key={segmentIndex}>{postText}</span> : null
    );
  }
  return narrative;
}

NarrativeWithLinks.propTypes = {
  // Audit narrative text containing formatted links
  narrative: PropTypes.string.isRequired,
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
 * Displays the details for one level of audits. The user can click a button here to open the audit
 * narrative for each audit at this level.
 */
function AuditLevelDetail({ level, children }) {
  // True if the narratives for an audit level are open
  const [areNarrativesOpen, setAreNarrativesOpen] = useState(false);

  return (
    <div
      className={`my-0.5 bg-audit-level-detail p-px`}
      data-testid={`audit-level-detail-${level}`}
    >
      <button
        className="mx-auto block rounded-full p-0.5 hover:bg-button-audit-level-detail"
        onClick={() => setAreNarrativesOpen(!areNarrativesOpen)}
        aria-label={`${areNarrativesOpen ? "Open" : "Closed"} narratives for ${
          auditMap[level]?.humanReadable || "Unknown"
        } audits`}
      >
        <Icon.EllipsisHorizontal className="w-6" />
      </button>
      {children(areNarrativesOpen)}
    </div>
  );
}

AuditLevelDetail.propTypes = {
  // Audit level
  level: PropTypes.string.isRequired,
};

/**
 * Displays the details of an audit, including all audit levels. The user can open audit details,
 * and then can also open the audit narratives for each audit level.
 */
export function AuditDetail({ item, auditState, className = null }) {
  const { isAuthenticated } = useAuth0();
  const hasAudits = item.audit && Object.keys(item.audit).length > 0;

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
          <div className={className}>
            {Object.keys(item.audit).map((level) => {
              if (isAuthenticated || publicLevels.includes(level)) {
                const levelAudits = item.audit[level];
                const AuditIcon = auditMap[level]?.Icon || null;
                return (
                  <AuditLevelDetail key={level} level={level}>
                    {(areNarrativesOpen) => {
                      return levelAudits.map((audit) => {
                        return (
                          <div
                            className={`my-px bg-panel p-1 first:mt-0 last:mb-0`}
                            key={`${audit.category}-${audit.detail}`}
                          >
                            <div className="flex items-center text-sm font-semibold">
                              {AuditIcon && (
                                <div className="mr-1 rounded-sm bg-audit dark:bg-transparent">
                                  <AuditIcon
                                    className={`h-5 w-5 ${auditMap[level].color}`}
                                  />
                                </div>
                              )}
                              <div>{audit.category}</div>
                            </div>
                            <AnimatePresence>
                              {areNarrativesOpen && (
                                <motion.div
                                  className="overflow-hidden text-sm leading-relaxed"
                                  initial="collapsed"
                                  animate="open"
                                  exit="collapsed"
                                  transition={standardAnimationTransition}
                                  variants={standardAnimationVariants}
                                >
                                  <div
                                    className="mt-2"
                                    data-testid={`audit-level-detail-narrative-${audit.level_name}`}
                                  >
                                    <NarrativeWithLinks
                                      narrative={audit.detail}
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      });
                    }}
                  </AuditLevelDetail>
                );
              }
              return null;
            })}
          </div>
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
  const itemAuditLevels = item.audit
    ? Object.keys(item.audit).filter((level) => {
        return isAuthenticated || publicLevels.includes(level);
      })
    : [];

  if (itemAuditLevels.length > 0) {
    // Make an array of the human-readable audit levels for screen readers.
    const auditLevelTexts = Object.keys(item.audit).map(
      (level) => auditMap[level]?.humanReadable || "Unknown"
    );

    return (
      <button
        onClick={auditState.toggleDetailsOpen}
        className={`border-audit flex h-[22px] items-center rounded-full border px-1 ${
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
          const Icon = auditMap[level]?.Icon;
          if (Icon) {
            return (
              <Icon
                className={`h-4 w-4 ${auditMap[level].color}`}
                key={level}
              />
            );
          }
          return null;
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
