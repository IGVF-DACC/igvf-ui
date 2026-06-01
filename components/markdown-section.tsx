// node_modules
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import { isValidElement, type ReactNode } from "react";
import Markdown, { type ExtraProps } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
// components
import { CopyButton } from "./copy-button";
import Link from "./link-no-prefetch";

/**
 * Types to define the props for the custom renderers for links and tables in the markdown content. These
 * allow us to specify the expected props for the custom renderers and ensure that we can pass through
 * any extra HTML attributes (e.g. data-testid) from raw HTML in the markdown content to the rendered
 * elements. The `node` prop is included to satisfy the type requirements of custom renderers in
 * react-markdown, but is not used in our renderers since we don't need access to the underlying
 * markdown AST nodes for our custom rendering logic.
 */
type AnchorProps = JSX.IntrinsicElements["a"] & ExtraProps;
type PreProps = JSX.IntrinsicElements["pre"] & ExtraProps;
type TableProps = JSX.IntrinsicElements["table"] & ExtraProps;

/**
 * Custom schema for rehype-sanitize to allow the style attribute on span elements, which is
 * necessary to support colored text and other inline properties while still filtering out other
 * HTML elements.
 */
export const rehypeSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), "style"],
  },
};

/**
 * Markdown component to intercept the rendering of links in markdown content and render them with
 * the Link component for internal links and anchors, and with an <a> tag for external links. This
 * allows us to ensure that internal links use client-side navigation while external links open in
 * a new tab with appropriate security attributes. Extra HTML attributes (e.g. data-testid) can be
 * added by writing raw HTML `<a>` tags in the markdown content rather than markdown link syntax,
 * since standard markdown link syntax ([text](url)) does not support extra attributes.
 *
 * @param href - URL that the link points to
 * @param children - Content of the link, which can be any valid React node(s)
 * @param props - Additional props that are passed through to the rendered link component, allowing
 *                for attributes like data-testid to be used in tests.
 */
function LinkRenderer({ href, children, node: _node, ...props }: AnchorProps) {
  if (!href) {
    return <>{children}</>;
  }

  // Use the Link component for internal links and anchors.
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  // Use the <a> tag for external links. We want to open external links in a new tab and use
  // rel="noreferrer" for security. Extra attributes from raw HTML <a> tags in the markdown
  // content are passed through via props.
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  );
}

/**
 * Custom renderer for code blocks in markdown content to wrap them in a <pre> element with a copy
 * button in the top-right corner.
 */
function PreRenderer({ children, node: _node, ...props }: PreProps) {
  const text = extractText(children);
  return (
    <pre {...props} className="relative">
      <CopyButton.Icon
        target={text}
        label="Copy code from this block"
        type="secondary"
        size="sm"
        className="absolute top-1 right-1"
      >
        {(isCopied) =>
          isCopied ? <CheckIcon /> : <ClipboardDocumentCheckIcon />
        }
      </CopyButton.Icon>
      {children}
    </pre>
  );
}

/**
 * Recursively extracts plain text from a React node tree. Used to get the copyable text content
 * from the `<pre>` element's children (typically `<code>` wrapping a string).
 *
 * @param node - React node from which to extract text. This can be a string, number, array of
 *               nodes, or a React element.
 * @returns The extracted plain text content as a string.
 */
function extractText(node: ReactNode): string {
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

/**
 * Custom renderer for tables in markdown content to wrap them in a div with overflow-x-auto to make
 * them horizontally scrollable on smaller screens. This is necessary because markdown tables can be
 * wider than the screen, and without this wrapper they would overflow and break the layout.
 *
 * @param children - <table> element generated by react-markdown from the markdown content, which
 *                   we wrap in a div to make it horizontally scrollable.
 * @param props - Additional props that are passed through to the rendered table element, allowing
 *                for attributes like data-testid to be used in tests.
 */
function TableRenderer({ children, node: _node, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table {...props}>{children}</table>
    </div>
  );
}

/**
 * This component provides a convenient way to render markdown as HTML while filtering out
 * dangerous content.
 *
 * @param direction - Text direction for the markdown content
 *   - "ltr" (left-to-right)
 *   - "rtl" (right-to-left)
 * @param className - Additional Tailwind CSS classes to apply to the wrapper div around the rendered HTML
 * @param testid - The test ID for the component, used for testing purposes
 * @param children - The markdown content to render as HTML
 */
export default function MarkdownSection({
  direction = "ltr",
  className,
  testid,
  suppressLeadingMargin = false,
  children,
}: {
  direction?: "ltr" | "rtl";
  className?: string;
  testid?: string;
  suppressLeadingMargin?: boolean;
  children: string;
}) {
  return (
    <div data-testid={testid} className="prose dark:prose-invert">
      <div
        dir={direction}
        className={`${suppressLeadingMargin ? "suppress-leading-margin" : ""} ${className ?? ""}`.trim()}
      >
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, rehypeSanitizeSchema]]}
          components={{
            a: LinkRenderer,
            pre: PreRenderer,
            table: TableRenderer,
          }}
        >
          {children}
        </Markdown>
      </div>
    </div>
  );
}
