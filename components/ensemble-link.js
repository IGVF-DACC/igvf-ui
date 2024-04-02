// node_modules
import PropTypes from "prop-types";

/**
 * Displays any Ensembl Gene ID as a link.
 * Clicking on the link takes you to Ensembl.org gene summary page.
 */

export default function EnsemblLink({ geneid, taxa }) {
  const organism = taxa.replace(/ /g, "_");
  return (
    <a href={`http://www.ensembl.org/${organism}/Gene/Summary?g=${geneid}`}>
      {geneid}
    </a>
  );
}

EnsemblLink.propTypes = {
  // GeneID to display as a link
  geneid: PropTypes.string.isRequired,
  // Metadata that affects certain dbxrefs
  taxa: PropTypes.string.isRequired,
};
