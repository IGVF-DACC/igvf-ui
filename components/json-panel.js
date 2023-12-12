// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  stackoverflowDark,
  stackoverflowLight,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
// components
import GlobalContext from "./global-context";

// NOTE: the import of the themes for react-systax-highlighter does not follow their documentation
// that appears incorrect, likely due to a bug. Instead of using the `esm` path, we have to use the
// `cjs` path.
// https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/509

/**
 * Display a JSON object as a code panel with code colorization.
 */
export default function JsonPanel({ id = null, className = "", children }) {
  const { darkMode } = useContext(GlobalContext);

  return (
    <SyntaxHighlighter
      id={id}
      language="json"
      style={darkMode.enabled ? stackoverflowDark : stackoverflowLight}
      className={`border-json-panel border text-xs ${className}`}
    >
      {children}
    </SyntaxHighlighter>
  );
}

JsonPanel.propTypes = {
  // Unique identifier for the component
  id: PropTypes.string,
  // Tailwind CSS classes to apply to the JSON panel
  className: PropTypes.string,
};
