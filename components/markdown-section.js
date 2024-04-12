// node_modules
import DOMPurify from "isomorphic-dompurify";
import Markdown from "marked-react";
import Link from "next/link";
import PropTypes from "prop-types";
// lib
import { isValidPath, isValidUrl } from "../lib/general";

const renderOptions = {
  /**
   * Render local links that don't cause a page reload, and external links that open in a new tab.
   */
  link(href, text, title) {
    // Open full URLs in a new tab.
    if (isValidUrl(href)) {
      return (
        <a
          key={this.elementId}
          href={href}
          title={title}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      );
    }

    // Open paths without reloading the page.
    if (isValidPath(href)) {
      return (
        <Link key={this.elementId} href={href} title={title}>
          {text}
        </Link>
      );
    }
  },

  /**
   * Wrap tables in a div with a CSS class to allow the table to scroll horizontally.
   */
  table(header, body) {
    return (
      <div key={this.elementId} className="markdown-table">
        <table>
          {header}
          {body}
        </table>
      </div>
    );
  },
};

/**
 * This component provides a convenient way to render markdown as HTML while filtering out
 * dangerous content.
 */
export default function MarkdownSection({
  direction = "ltr",
  className = null,
  testid = null,
  children,
}) {
  const sanitizedHtml = DOMPurify.sanitize(children);
  return (
    <div data-testid={testid} className="prose dark:prose-invert">
      <div dir={direction} className={className}>
        <Markdown renderer={renderOptions}>{sanitizedHtml}</Markdown>
      </div>
    </div>
  );
}

MarkdownSection.propTypes = {
  // The direction of the text
  direction: PropTypes.oneOf(["ltr", "rtl"]),
  // Tailwind CSS classes to add to the wrapper div around the HTML
  className: PropTypes.string,
  // The test ID for the component
  testid: PropTypes.string,
};
