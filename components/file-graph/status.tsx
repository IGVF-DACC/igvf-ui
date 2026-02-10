// components
import { getStatusStyleAndIcon } from "../status";
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// components/file-graph
import { NODE_WIDTH } from "./lib";
// root
import { FileObject } from "../../globals";

/**
 * Render a status glyph (icon) positioned at (cx, cy) with a given size, centered on that point.
 *
 * @param cx - x-coordinate of the center point for the glyph
 * @param cy - y-coordinate of the center point for the glyph
 * @param size - Desired rendered size of the glyph in the same units as the parent SVG
 * @param Glyph - React component that renders the glyph icon, designed to fit in a 20x20 viewBox
 */
function PositionedStatusGlyph({
  cx,
  cy,
  size,
  fill,
  Glyph,
}: {
  cx: number;
  cy: number;
  size: number;
  fill: string;
  Glyph: () => JSX.Element;
}) {
  // viewBox is 0..20, so scale factor is size / 20.
  const scale = size / 20;

  // To center: translate to (cx, cy), scale, then translate glyph center (-10, -10)
  const transform = `translate(${cx} ${cy}) scale(${scale}) translate(${-10} ${-10})`;

  return (
    <g transform={transform} fill={fill}>
      <Glyph />
    </g>
  );
}

/**
 * Display the status indicator in a file node.
 *
 * @param file - File object whose status to display in its node
 */
export function NodeStatus({ file }: { file: FileObject }) {
  const tooltipAttr = useTooltip(`node-status-tooltip-${file.accession}`);
  const { Glyph, colorValues } = getStatusStyleAndIcon(file.status);

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <g data-file-graph-status={file.status}>
          <circle
            cx={NODE_WIDTH - 12}
            cy={10}
            r={8}
            fill={`var(${colorValues.bg})`}
          />
          <PositionedStatusGlyph
            cx={NODE_WIDTH - 12}
            cy={10}
            size={16}
            fill={`var(${colorValues.text})`}
            Glyph={Glyph}
          />
        </g>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{file.status}</Tooltip>
    </>
  );
}
