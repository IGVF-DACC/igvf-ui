// node_modules
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import PropTypes from "prop-types";

/**
 * This component provides a convenient way to render markdown as HTML while filtering out
 * dangerous content.
 */
const Markdown = ({ markdown, direction = "ltr", className = "" }) => {
  const rawConvertedHtml = marked(markdown);
  const sanitizedHtml = DOMPurify.sanitize(rawConvertedHtml);
  return (
    <div
      dir={direction}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

Markdown.propTypes = {
  // The markdown to render
  markdown: PropTypes.string.isRequired,
  // The direction of the text
  direction: PropTypes.oneOf(["ltr", "rtl"]),
  // Tailwind CSS classes to add to the wrapper div around the HTML
  className: PropTypes.string,
};

export default Markdown;
