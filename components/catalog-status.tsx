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
            fill="#f8e383"
            d="M10 19.2a9.14 9.14 0 0 1-6.505-2.694c-3.587-3.588-3.587-9.424 0-13.012C5.232 1.757 7.542.8 10 .8s4.768.957 6.506 2.694c3.587 3.587 3.587 9.423 0 13.011A9.14 9.14 0 0 1 10 19.199Z"
          />
          <path
            fill="#987c39"
            d="M10 1.6c2.244 0 4.353.874 5.94 2.46 3.275 3.275 3.275 8.604 0 11.879-1.587 1.587-3.696 2.46-5.94 2.46s-4.353-.874-5.94-2.46C.785 12.665.785 7.335 4.06 4.06A8.34 8.34 0 0 1 10 1.6M10 0a9.97 9.97 0 0 0-7.071 2.929c-3.905 3.905-3.905 10.237 0 14.142C4.882 19.024 7.441 20 10 20s5.118-.976 7.071-2.929c3.905-3.905 3.905-10.237 0-14.142A9.97 9.97 0 0 0 10 0"
          />
          <g fill="#695527">
            <path d="M7.143 4.143h5.714v2.286H7.143zM7.143 13.571h5.714v2.286H7.143z" />
            <path d="M4.857 13.571V6.428h2.286v7.143zM12.858 8.714V6.428h2.286v2.286zM12.857 13.572v-2.286h2.286v2.286z" />
          </g>
        </g>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{tooltip || "Catalog file"}</Tooltip>
    </>
  );
}
