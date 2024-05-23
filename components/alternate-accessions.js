// node_modules
import PropTypes from "prop-types";

/**
 * Display the alternate accessions, normally below the header line in objects.
 */
export default function AlternateAccessions({
  alternateAccessions = [],
  className = "text-sm text-gray-500",
  isTitleHidden = false,
}) {
  if (alternateAccessions.length > 0) {
    return (
      <div className={className}>
        {alternateAccessions.length === 1 ? (
          <>
            {!isTitleHidden ? "Alternate Accession: " : ""}
            {alternateAccessions[0]}
          </>
        ) : (
          <>
            {!isTitleHidden ? "Alternate Accessions: " : ""}
            {alternateAccessions.join(", ")}
          </>
        )}
      </div>
    );
  }

  // No alternate accessions to display.
  return null;
}

AlternateAccessions.propTypes = {
  // Array of alternate accession strings
  alternateAccessions: PropTypes.arrayOf(PropTypes.string),
  // Optional Tailwind CSS classes for the wrapper <div>
  className: PropTypes.string,
  // Whether to hide the title "Alternate Accessions" from the display
  isTitleHidden: PropTypes.bool,
};
