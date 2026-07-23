// components
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// root
import type { FileObject } from "../globals";

/**
 * Display a catalog status icon for a file, with a tooltip that says "Catalog file" when hovered
 * over. This includes a border around the icon that fits with other status icon displays.
 *
 * @param file - File object for which to display the catalog status icon
 * @param tooltip - Optional tooltip text to display when hovered over. Defaults to "Catalog file"
 */
export function CatalogStatus({
  file,
  tooltip,
}: {
  file: FileObject;
  tooltip?: string;
}) {
  return (
    <div
      className="ring-status-icon-ring-catalog h-5 w-5 rounded-full border border-white ring"
      data-testid={`catalog-status-icon-${file.accession}`}
    >
      <svg
        viewBox="0 0 20 20"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <CatalogStatusGlyph id={file.accession} tooltip={tooltip} />
      </svg>
    </div>
  );
}

/**
 * Display a catalog status icon for a file, with a tooltip that says "Catalog file" when hovered
 * over. Use this instead of `CatalogStatus` when you only want to display the glyph without the
 * surrounding border. This is intended mostly for the file graph that includes stripped-down
 * statuses to fit in the file nodes. The caller must determine whether the file is in the catalog
 * or not, and only call this component if it is. Only the contents of the SVG are displayed, so the
 * caller must wrap this in an SVG element. This allows this component to be used within a larger
 * `<svg>` element, such as the file graph.
 *
 * @param id - ID of the file for which to display the catalog status icon
 * @param tooltip - Optional tooltip text to display when hovered over. Defaults to "Catalog file"
 */
export function CatalogStatusGlyph({
  id,
  tooltip,
}: {
  id: string;
  tooltip?: string;
}) {
  const tooltipAttr = useTooltip(`node-status-tooltip-catalog-${id}`);

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <g>
          <path
            d="M10,19.2c-2.458,0-4.768-.957-6.505-2.694C-.092,12.918-.092,7.082,3.495,3.494,5.232,1.757,7.542.8,10,.8s4.768.957,6.506,2.694c3.587,3.587,3.587,9.423,0,13.011-1.738,1.737-4.048,2.694-6.506,2.694Z"
            style={{ fill: "#faef9c" }}
          />
          <path
            d="M10,1.6c2.244,0,4.353.874,5.94,2.46,3.275,3.275,3.275,8.604,0,11.879-1.587,1.587-3.696,2.46-5.94,2.46s-4.353-.874-5.94-2.46C.785,12.665.785,7.335,4.06,4.06c1.587-1.587,3.696-2.46,5.94-2.46M10,0c-2.559,0-5.118.976-7.071,2.929-3.905,3.905-3.905,10.237,0,14.142,1.953,1.953,4.512,2.929,7.071,2.929s5.118-.976,7.071-2.929c3.905-3.905,3.905-10.237,0-14.142-1.953-1.953-4.512-2.929-7.071-2.929h0Z"
            style={{ fill: "#987c39" }}
          />
          <g style={{ fill: "#695527" }}>
            <circle cx="6.721" cy="6.181" r="1.909" />
            <circle cx="14.947" cy="9.07" r="1.909" />
            <circle cx="8.332" cy="14.75" r="1.909" />
          </g>
          <polygon
            points="14.947 9.07 8.332 14.75 6.721 6.181 14.947 9.07"
            style={{
              fill: "none",
              stroke: "#695527",
              strokeMiterlimit: 10,
              strokeWidth: "1.5px",
            }}
          />
        </g>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{tooltip || "Catalog file"}</Tooltip>
    </>
  );
}
