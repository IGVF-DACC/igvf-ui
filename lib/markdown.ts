import { isValidElement, type ReactNode } from "react";

/**
 * The prefix used for clobbering IDs in the remark-heading-ids plugin. This prefix is used to
 * prevent ID collisions accidentally or maliciously created by users in the markdown content. The
 * prefix is prepended to the named ID extracted from the {#named-id-1} syntax in headings.
 */
export const REMARK_CLOBBER_PREFIX = "user-content";

/**
 * Recursively extracts plain text from a React node tree. Used to get the copyable text content
 * from the `<pre>` element's children (typically `<code>` wrapping a string).
 *
 * @param node - React node from which to extract text. This can be a string, number, array of
 *               nodes, or a React element.
 * @returns The extracted plain text content as a string.
 */
export function extractText(node: ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    // Recursively extract text from each child node and concatenate the results.
    return (node as ReactNode[]).map(extractText).join("");
  }
  if (isValidElement(node)) {
    // Recursively extract text from the child elements of the React element.
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}
