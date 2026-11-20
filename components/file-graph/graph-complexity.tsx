// components
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// lib
import { formatNumber } from "../../lib/general";
// local
import { type GraphComplexity } from "./lib";

/**
 * Explain that a file association graph is too complex to display. Show each complexity metric,
 * indicate whether it exceeds its display threshold, and provide an accessible status description
 * for screen readers.
 *
 * @param complexity - Object containing graph complexity metrics and threshold information
 * @param panelId - Identifier for the panel containing the graph; unique on the page
 */
export function GraphComplexityError({
  complexity,
  panelId,
}: {
  complexity: GraphComplexity;
  panelId: string;
}) {
  const diagnostics = [
    {
      label: "n",
      screenLabel: "Number of nodes",
      annotation: `Number of nodes in the graph; max allowed: ${formatNumber(complexity.thresholds.nodeCount)}`,
      value: formatNumber(complexity.nodeCount),
      exceeded: complexity.exceeded.nodeCount,
    },
    {
      label: "e",
      screenLabel: "Number of edges",
      annotation: `Number of edges in the graph; max allowed: ${formatNumber(complexity.thresholds.edgeCount)}`,
      value: formatNumber(complexity.edgeCount),
      exceeded: complexity.exceeded.edgeCount,
    },
    {
      label: "e/n",
      screenLabel: "Edge-to-node ratio",
      annotation: `Edge-to-node ratio; max allowed: ${complexity.thresholds.edgeToNodeRatio.toFixed(2)}`,
      value: complexity.edgeToNodeRatio.toFixed(2),
      exceeded: complexity.exceeded.edgeToNodeRatio,
    },
    {
      label: "deg",
      screenLabel: "Maximum degree",
      annotation: `Maximum number of edges connected to a single node; max allowed: ${formatNumber(complexity.thresholds.maxDegree)}`,
      value: formatNumber(complexity.maxDegree),
      exceeded: complexity.exceeded.maxDegree,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <p className="italic">
        This graph is too complex to display. The diagnostics below highlight
        which complexity metrics exceeded their display thresholds.
      </p>
      <dl className="flex flex-wrap gap-1">
        {diagnostics.map(
          ({ label, annotation, value, exceeded, screenLabel }) => (
            <GraphComplexityDebugBadge
              key={label}
              label={label}
              screenLabel={screenLabel}
              annotation={annotation}
              value={value}
              exceeded={exceeded}
              panelId={panelId}
            />
          )
        )}
      </dl>
    </div>
  );
}

/**
 * Display a badge for a single graph complexity diagnostic, with a tooltip explaining the metric.
 *
 * @param label - Short label for the metric (e.g., "n" for node count)
 * @param annotation - Tooltip text explaining the metric
 * @param value - Current value of the metric
 * @param exceeded - True if the metric exceeds its threshold
 * @param panelId - Identifier for the panel containing the graph; unique on the page
 */
function GraphComplexityDebugBadge({
  label,
  screenLabel,
  annotation,
  value,
  exceeded,
  panelId,
}: {
  label: string;
  screenLabel: string;
  annotation: string;
  value: string;
  exceeded: boolean;
  panelId: string;
}) {
  const tooltipAttr = useTooltip(`${panelId}-${label}`);

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div
          tabIndex={0}
          className={`flex gap-1 px-1 py-px text-xs text-gray-800 dark:text-gray-200 ${exceeded ? "bg-red-300 dark:bg-red-700" : "bg-green-200 dark:bg-green-900"}`}
        >
          <dt>
            <span aria-hidden="true">{label}</span>
            <span className="sr-only">{screenLabel}</span>
          </dt>
          <dd>
            {value}
            <span className="sr-only">
              {exceeded ? ", threshold exceeded" : ", within limit"}
            </span>
          </dd>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{annotation}</Tooltip>
    </>
  );
}
