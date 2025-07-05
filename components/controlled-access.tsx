// node_modules
import { LockClosedIcon } from "@heroicons/react/20/solid";
// components
import { PillBadge } from "./pill-badge";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// root
import type { DatabaseObject } from "../globals";

/**
 * Displays a controlled access indicator for an object.
 * @param item - The object to display the controlled access indicator for.
 */
export function ControlledAccessIndicator({ item }: { item: DatabaseObject }) {
  const tooltipAttr = useTooltip("controlled-access-indicator");

  if (item.controlled_access) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div>
            <PillBadge
              className="bg-[#ed1c24] ring-[#c6171d]"
              testid="controlled-access-badge"
            >
              <LockClosedIcon className="h-3 w-3 fill-white" />
            </PillBadge>
          </div>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>Controlled access</Tooltip>
      </>
    );
  }
}
