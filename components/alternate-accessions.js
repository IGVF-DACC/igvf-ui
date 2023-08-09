// node_modules
import PropTypes from "prop-types";

/**
 * // Display the alternate accessions, normally below the header line in objects.
 */
export const AlternateAccession = (alternate_accessions) => {
  const { altAcc } = alternate_accessions;

  if (altAcc && altAcc.length > 0) {
    return (
      <h4 className="alternate-accessions">
        {altAcc.length === 1 ? (
          <span>Alternate accession: {altAcc[0]}</span>
        ) : (
          <span>Alternate accessions: {altAcc.join(", ")}</span>
        )}
      </h4>
    );
  }

  // No alternate accessions to display.
  return null;
};

AlternateAccession.propTypes = {
  altAcc: PropTypes.arrayOf(PropTypes.string).isRequired, // Array of alternate accession strings
};

AlternateAccession.defaultProps = {
  altAcc: null,
};
