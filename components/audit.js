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
      <path d="M18.9,16L11.2,2.7c-0.5-0.9-1.9-0.9-2.4,0L1.1,16C0.6,16.9,1.3,18,2.3,18h15.4C18.7,18,19.4,16.9,18.9,16z" />
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
      <circle cx="10" cy="10" r="8" />
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
      <path d="M18,4.2C18,3,17,2,15.8,2H4.2C3,2,2,3,2,4.2v11.5C2,17,3,18,4.2,18h11.5c1.2,0,2.3-1,2.3-2.3" />
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
      <path d="M18.9,4l-7.7,13.3c-0.5,0.9-1.9,0.9-2.4,0L1.1,4C0.6,3.1,1.3,2,2.3,2h15.4C18.7,2,19.4,3.1,18.9,4z" />
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
const auditMap = {
  ERROR: {
    Icon: ErrorIcon,
    color: "fill-red-500",
    humanReadable: "Error",
  },
  WARNING: {
    Icon: WarningIcon,
    color: "fill-orange-500",
    humanReadable: "Warning",
  },
  NOT_COMPLIANT: {
    Icon: NotCompliantIcon,
    color: "fill-fuchsia-500",
    humanReadable: "Not Compliant",
  },
  INTERNAL_ACTION: {
    Icon: InternalActionIcon,
    color: "fill-blue-600",
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
                                <AuditIcon
                                  className={`mr-1 h-5 w-5 ${auditMap[level].color}`}
                                />
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
  const hasAudits = item.audit && Object.keys(item.audit).length > 0;

  if (hasAudits) {
    // Make an array of the human-readable audit levels for screen readers.
    const auditLevelTexts = Object.keys(item.audit).map(
      (level) => auditMap[level]?.humanReadable || "Unknown"
    );

    return (
      <button
        onClick={auditState.toggleDetailsOpen}
        className={`flex h-[22px] items-center rounded-full border border-button-audit px-1 ${
          auditState.isDetailOpen
            ? "bg-button-audit-open"
            : "bg-button-audit-closed"
        }`}
        aria-label={`${
          auditState.isDetailOpen ? "Opened" : "Closed"
        } audits for ${auditLevelTexts.join(", ")}`}
        data-testid="audit-status-button"
      >
        {Object.keys(item.audit).map((level) => {
          if (isAuthenticated || publicLevels.includes(level)) {
            const Icon = auditMap[level]?.Icon;
            if (Icon) {
              return (
                <Icon
                  className={`h-3 w-3 ${auditMap[level].color}`}
                  key={level}
                />
              );
            }
            return null;
          }
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
