// node_modules
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { Children, useContext } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  lightfair,
  stackoverflowDark,
  stackoverflowLight,
  tomorrowNightBright,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
// components
import CopyButton from "./copy-button";
import GlobalContext from "./global-context";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";

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
 * Use this to wrap each tool within the JSON panel tools. This component is used to identify the
 * panel tools within this section so `<JsonPanel>` can give these components special
 * treatment.
 */
export function JsonPanelTool({ children }) {
  return <>{children}</>;
}

/**
 * Display the tools in the upper right corner of the JSON panel. This includes the button to copy
 * the JSON to the clipboard. The parent component can provide extra tools to display next to this
 * button.
 */
function JsonPanelTools({ target, children }) {
  const tooltipAttr = useTooltip("json-copy");

  return (
    <div className="absolute right-1 top-1 flex gap-1">
      {children}
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div>
          <CopyButton.Icon
            target={target}
            label="Copy JSON to clipboard"
            size="sm"
          >
            {(isCopied) =>
              isCopied ? <CheckIcon /> : <ClipboardDocumentCheckIcon />
            }
          </CopyButton.Icon>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>Copy JSON to clipboard</Tooltip>
    </div>
  );
}

JsonPanelTools.propTypes = {
  // React components or elements that are the target of the tools
  target: PropTypes.string.isRequired,
};

/**
 * Display a JSON object as a code panel with code colorization.
 */
export default function JsonPanel({
  id = null,
  isLowContrast = false,
  isBorderHidden = false,
  className = "",
  children,
}) {
  // Extract just the <JsonPanelTool> children from the children prop
  const toolChildren = Children.toArray(children).filter(
    (child) => child.type === JsonPanelTool
  );
  const contentChildren = Children.toArray(children).filter(
    (child) => child.type !== JsonPanelTool
  );
  const jsonContent = contentChildren.length > 0 ? contentChildren[0] : "";

  const { darkMode } = useContext(GlobalContext);
  const modeThemes = isLowContrast
    ? themeMap.lowContrast
    : themeMap.highContrast;
  const theme = darkMode.enabled ? modeThemes.dark : modeThemes.light;

  return (
    <div className="relative">
      <SyntaxHighlighter
        id={id}
        language="json"
        style={theme}
        className={`text-xs ${
          isBorderHidden ? "" : "border border-json-panel"
        } ${className}`}
      >
        {contentChildren}
      </SyntaxHighlighter>
      <JsonPanelTools target={jsonContent}>{toolChildren}</JsonPanelTools>
    </div>
  );
}

JsonPanel.propTypes = {
  // Unique identifier for the component
  id: PropTypes.string,
  // True for low-contrast themes
  isLowContrast: PropTypes.bool,
  // True to hide the JSON panel border
  isBorderHidden: PropTypes.bool,
  // Tailwind CSS classes to apply to the JSON panel
  className: PropTypes.string,
};
