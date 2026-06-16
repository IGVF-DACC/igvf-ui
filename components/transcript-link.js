// node_modules
import PropTypes from "prop-types";

/**
 * Displays any Ensembl Transcript ID as a link. Clicking on the link takes
 * you to the Ensembl transcript summary page.
 */
export default function TranscriptLink({ transcriptid }) {
  let organism = "";

  if (transcriptid.startsWith("ENST")) {
    organism = "Homo_sapiens";
  } else if (transcriptid.startsWith("ENSMUST")) {
    organism = "Mus_musculus";
  }

  if (organism) {
    return (
      <a
        href={`https://www.ensembl.org/${organism}/Transcript/Summary?t=${transcriptid}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {transcriptid}
      </a>
    );
  }

  return <>{transcriptid}</>;
}

TranscriptLink.propTypes = {
  // Transcript ID to display as a link
  transcriptid: PropTypes.string.isRequired,
};
