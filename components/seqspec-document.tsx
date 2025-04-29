// node_modules
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
// components
import DocumentAttachmentLink from "./document-link";
// lib
import { generateButtonClasses } from "../lib/form-elements";
// root
import type { DocumentObject } from "../globals";

/**
 * Display a link to a Seqspec document along with a download button.
 * @param seqspecDocument - seqspec document object containing the download link
 * @param className - additional CSS classes to apply to the link
 */
export function SeqspecDocumentLink({
  seqspecDocument,
  className = "",
}: {
  seqspecDocument: DocumentObject;
  className?: string;
}) {
  const seqspecDocumentLinkClasses = generateButtonClasses(
    "secondary",
    "sm",
    true
  );

  return (
    <div className={className}>
      <Link
        href={seqspecDocument["@id"]}
        className="mr-1 inline-block break-all"
      >
        {seqspecDocument.attachment.download}
      </Link>
      <DocumentAttachmentLink
        document={seqspecDocument}
        className={`inline-flex items-center ${seqspecDocumentLinkClasses}`}
      >
        <ArrowDownTrayIcon className="h-3 w-3" />
      </DocumentAttachmentLink>
    </div>
  );
}
