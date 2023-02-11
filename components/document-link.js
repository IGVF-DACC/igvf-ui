// node_modules
import PropTypes from "prop-types";
// components
import { attachmentToServerHref } from "../lib/attachment";

/**
 * Display a link to the given document's attachment. The link opens in a new tab.
 */
export default function DocumentAttachmentLink({ document }) {
  return (
    <a
      className="break-all"
      href={attachmentToServerHref(document.attachment, document["@id"])}
      target="_blank"
      rel="noreferrer"
      aria-label={`Download ${document.attachment.download}`}
    >
      {document.attachment.download}
      <span className="sr-only">{`Download ${document.attachment.download}`}</span>
    </a>
  );
}

DocumentAttachmentLink.propTypes = {
  // Document whose attachment to link to
  document: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    attachment: PropTypes.shape({
      download: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
