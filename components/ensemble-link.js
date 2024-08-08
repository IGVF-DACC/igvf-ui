// node_modules
import PropTypes from "prop-types";

/**
 * Displays any Ensembl Gene ID as a link. Clicking on the link takes you to Ensembl.org gene
 * summary page.
 */
export default function EnsemblLink({ geneid }) {
  let organism = "";
  if (geneid.startsWith("ENSG")) {
    organism = "Homo_sapiens";
  } else if (geneid.startsWith("ENSMUSG")) {
    organism = "Mus_musculus";
  }

  if (organism) {
    return (
      <a
        href={`http://www.ensembl.org/${organism}/Gene/Summary?g=${geneid}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {geneid}
      </a>
    );
  }
  return <>{geneid}</>;
}

EnsemblLink.propTypes = {
  // GeneID to display as a link
  geneid: PropTypes.string.isRequired,
};
