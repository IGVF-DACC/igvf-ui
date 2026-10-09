// node_modules
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import { useId } from "react";
// components
import Link from "./link-no-prefetch";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { attachmentToServerHref } from "../lib/attachment";
import { truncateText } from "../lib/general";
// root
import type { DocumentObject } from "../globals";

/**
 * Common prefixes in document descriptions that can be removed for display purposes.
 */
const deletedDocumentDescriptionPrefixes = [
  "file format description for",
  "file format for",
  "file format specification file for",
  "file format specification for",
  "file format specification of",
  "file format specifications for",
  "format specification for",
];

/**
 * Display a link to the given document's attachment. The link opens in a new tab.
 *
 * @param document - Document whose attachment to link to
 * @param className - Optional classes to style the link
 */
export function DocumentAttachmentLink({
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

/**
 * Display a list of documents as links to their document pages. Display the document description as
 * the link title.
 *
 * @param documents - Documents to display as links
 * @param maxLength - Maximum number of characters in the description before truncation
 * @param className - Optional classes to style the list
 */
export function DocumentListAbbr({
  documents,
  maxLength = 20,
  className = "",
}: {
  documents: DocumentObject[];
  maxLength?: number;
  className?: string;
}) {
  return (
    <ul className={className}>
      {documents.map((document) => (
        <li key={document["@id"]} className="whitespace-nowrap">
          <DocumentListLink document={document} maxLength={maxLength} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Display a link to the given document's page with optional truncation and tooltip.
 *
 * @param document - Document to link to
 * @param maxLength - Maximum number of characters in the description before truncation
 */
function DocumentListLink({
  document,
  maxLength,
}: {
  document: DocumentObject;
  maxLength: number;
}) {
  const uniqueId = useId();
  const tooltipAttr = useTooltip(`${document["@id"]}-${uniqueId}`);

  // Determine whether the document description starts with a common prefix phrase we can delete. If
  // it does, remove the prefix from the description.
  const lowercaseDescription = document.description.toLowerCase();
  const deletedPrefix = deletedDocumentDescriptionPrefixes.find((prefix) =>
    lowercaseDescription.startsWith(`${prefix} `)
  );
  const description = deletedPrefix
    ? document.description.slice(deletedPrefix.length).replace(/^ /, "")
    : document.description;

  // Truncate the description if it exceeds the maximum length.
  const truncatedText = truncateText(description, maxLength);

  // If the truncated text is different from the original description, display the truncated text
  // with a tooltip containing the full description.
  if (truncatedText !== document.description) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <DocumentLink
            href={document["@id"]}
            description={truncatedText}
            describedBy={tooltipAttr.id}
          />
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>{document.description}</Tooltip>
      </>
    );
  }

  // The truncated text is the same as the original description, so we can display it directly without a tooltip.
  return (
    <DocumentLink href={document["@id"]} description={document.description} />
  );
}

/**
 * Display a link to the given document's page with an icon.
 *
 * @param href - URL of the document page
 * @param description - Description of the document to display as the link text
 */
function DocumentLink({
  href,
  description,
  describedBy,
}: {
  href: string;
  description: string;
  describedBy?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-1"
      aria-describedby={describedBy}
    >
      <DocumentTextIcon className="h-5 w-5 shrink-0 fill-zinc-600 dark:fill-zinc-400" />
      <span className="min-w-0">{description}</span>
    </Link>
  );
}
