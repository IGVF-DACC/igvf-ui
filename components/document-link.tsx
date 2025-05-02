// components
import { attachmentToServerHref } from "../lib/attachment";
// root
import { DocumentObject } from "../globals";

/**
 * Display a link to the given document's attachment. The link opens in a new tab.
 * @param document - Document whose attachment to link to
 * @param className - Optional classes to style the link
 */
export default function DocumentAttachmentLink({
  document,
  className = "",
  children = null,
}: {
  document: DocumentObject;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      className={className || "break-all"}
      href={attachmentToServerHref(document.attachment, document["@id"])}
      target="_blank"
      rel="noreferrer"
      aria-label={`Download ${document.attachment.download}`}
    >
      {children || document.attachment.download}
    </a>
  );
}
