// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  lightfair,
  stackoverflowDark,
  stackoverflowLight,
  tomorrowNightBright,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
// components
import GlobalContext from "./global-context";

// NOTE: the import of the themes for react-syntax-highlighter does not follow their documentation
// that appears incorrect, likely due to a bug. Instead of using the `esm` path, we have to use the
// `cjs` path.
// https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/509

/**
 * Selects a react-syntax-highlighter theme based on the the contrast mode and light/dark mode. See
 * the React syntax highlighter demo to try out the available themes:
 * https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/
 */
const themeMap = {
  highContrast: {
    light: lightfair,
    dark: tomorrowNightBright,
  },
  lowContrast: {
    light: stackoverflowLight,
    dark: stackoverflowDark,
  },
};

/**
 * Display a JSON object as a code panel with code colorization.
 */
export default function JsonPanel({
  id = null,
  isLowContrast = false,
  className = "",
  children,
}) {
  const { darkMode } = useContext(GlobalContext);
  const modeThemes = isLowContrast
    ? themeMap.lowContrast
    : themeMap.highContrast;
  const theme = darkMode.enabled ? modeThemes.dark : modeThemes.light;

  return (
    <SyntaxHighlighter
      id={id}
      language="json"
      style={theme}
      className={`border border-json-panel text-xs ${className}`}
    >
      {children}
    </SyntaxHighlighter>
  );
}

JsonPanel.propTypes = {
  // Unique identifier for the component
  id: PropTypes.string,
  // True for low-contrast themes
  isLowContrast: PropTypes.bool,
  // Tailwind CSS classes to apply to the JSON panel
  className: PropTypes.string,
};
