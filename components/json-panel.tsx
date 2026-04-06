// node_modules
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import {
  Children,
  type ComponentType,
  isValidElement,
  useContext,
} from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  lightfair,
  stackoverflowDark,
  stackoverflowLight,
  tomorrowNightBright,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
// components
import { CopyButton } from "./copy-button";
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
 * This is a redeclaration of the `SyntaxHighlighter` component from `react-syntax-highlighter`
 * because its TypeScript types are not compatible with our usage of it.
 */
const SyntaxHighlighterComponent =
  SyntaxHighlighter as unknown as ComponentType<any>;

/**
 * Use this to wrap each tool within the JSON panel tools. This component is used to identify the
 * panel tools within this section so `<JsonPanel>` can give these components special
 * treatment.
 */
export function JsonPanelTool({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Display the tools in the upper right corner of the JSON panel. This includes the button to copy
 * the JSON to the clipboard. The parent component can provide extra tools to display next to this
 * button.
 *
 * @param target Text to copy to the clipboard when the copy button is clicked.
 */
function JsonPanelTools({
  target,
  children,
}: {
  target: string;
  children: React.ReactNode;
}) {
  const tooltipAttr = useTooltip("json-copy");

  return (
    <div className="absolute top-1 right-1 flex gap-1">
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

/**
 * Display a JSON object as a code panel with code colorization.
 *
 * @param id - Optional unique identifier for the component
 * @param highlightedLines - Optional array of 1-based line numbers to highlight
 * @param isLowContrast - Optional boolean to use low contrast colors for the code panel
 * @param isBorderHidden - Optional boolean to hide the border of the code panel
 * @param className - Optional additional Tailwind CSS classes to apply to the code panel
 */
export default function JsonPanel({
  id = null,
  highlightedLines = [],
  isLowContrast = false,
  isBorderHidden = false,
  className = "",
  children,
}: {
  id?: string | null;
  highlightedLines?: number[];
  isLowContrast?: boolean;
  isBorderHidden?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  // Extract just the <JsonPanelTool> children from the children prop
  const toolChildren = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === JsonPanelTool
  );
  const contentChildren = Children.toArray(children).filter(
    (child) => !isValidElement(child) || child.type !== JsonPanelTool
  );
  const jsonContent = contentChildren
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      return "";
    })
    .join("");

  const { darkMode } = useContext(GlobalContext);
  const modeThemes = isLowContrast
    ? themeMap.lowContrast
    : themeMap.highContrast;
  const theme = darkMode.enabled ? modeThemes.dark : modeThemes.light;

  return (
    <div className="relative">
      <SyntaxHighlighterComponent
        id={id}
        language="json"
        style={theme}
        className={`text-xs ${
          isBorderHidden ? "" : "border-json-panel border"
        } ${className}`}
        lineNumberStyle={{ display: "none" }}
        lineProps={(lineNumber: number) => {
          const isAdded = highlightedLines.includes(lineNumber);
          if (isAdded) {
            return {
              className: "bg-yellow-300 dark:bg-blue-800",
            };
          }
          const isDeleted = highlightedLines.includes(-lineNumber);
          if (isDeleted) {
            return {
              className: "border-t-4 border-red-500 dark:border-red-800",
            };
          }
          return {};
        }}
        showLineNumbers
        wrapLines
      >
        {jsonContent}
      </SyntaxHighlighterComponent>
      <JsonPanelTools target={jsonContent}>{toolChildren}</JsonPanelTools>
    </div>
  );
}
