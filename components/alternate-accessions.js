// node_modules
import PropTypes from "prop-types";

/**
 * // Display the alternate accessions, normally below the header line in objects.
 */
export default function AlternateAccession({ alternateAccessions = [] }) {
  if (alternateAccessions?.length > 0) {
    return (
      <h4 className="text-gray-500">
        {alternateAccessions.length === 1 ? (
          <span>Alternate Accession: {alternateAccessions[0]}</span>
        ) : (
          <span>Alternate Accessions: {alternateAccessions.join(", ")}</span>
        )}
      </h4>
    );
  }

  // No alternate accessions to display.
  return null;
}

AlternateAccession.propTypes = {
  alternateAccessions: PropTypes.arrayOf(PropTypes.string), // Array of alternate accession strings
};
