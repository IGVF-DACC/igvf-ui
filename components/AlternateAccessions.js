// node_modules
import PropTypes from "prop-types";

/**
 * Display the alternate accessions, normally below the header line in objects.
 */
export default function AlternateAccessions({ alternateAccessions = [] }) {
  if (alternateAccessions.length > 0) {
    return (
      <h4 className="text-sm text-gray-500">
        {alternateAccessions.length === 1 ? (
          <>Alternate Accession: {alternateAccessions[0]}</>
        ) : (
          <>Alternate Accessions: {alternateAccessions.join(", ")}</>
        )}
      </h4>
    );
  }

  // No alternate accessions to display.
  return null;
}

AlternateAccessions.propTypes = {
  // Array of alternate accession strings
  alternateAccessions: PropTypes.arrayOf(PropTypes.string),
};
