import { Tooltip, TooltipRef, useTooltip } from "./tooltip";

/**
 * Maps the icon position to the corresponding Tailwind CSS classes to apply the proper padding.
 */
const iconPositionClasses = {
  left: "pl-0.5 pr-1.5",
  right: "pl-1.5 pr-0.5",
  "": "px-1.5",
};

/**
 * Displays an icon-only pill badge with a tooltip that shows the full label.
 * @param className Additional Tailwind CSS to apply to the badge
 * @param testid data-testid attribute to apply to the badge
 * @param abbreviatedLabel Text to display in the tooltip
 */
function AbbreviatedPillBadge({
  abbreviatedLabel,
  className,
  testid,
  children,
}: {
  abbreviatedLabel: string;
  className?: string;
  testid?: string;
  children: React.ReactNode;
}) {
  const tooltipAttr = useTooltip(`pill-badge${testid ? `-${testid}` : ""}`);

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div
          className={`h-4.5 w-4.5 rounded-full border border-white ring ${className}`}
          data-testid={`${testid ? `${testid}-` : ""}abbreviated-pill`}
        >
          {children}
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{abbreviatedLabel}</Tooltip>
    </>
  );
}

/**
 * Wrapper component to standardize the look of all pill-style badges, that usually contain a small
 * icon and all-uppercase text. A common example is the badge to show object status. You have the
 * option of displaying an icon-only badge with a tooltip to show its full label by passing an
 * abbreviatedLabel with the text for the tooltip. For that case, just pass an icon as the child
 * component.
 * @param iconPosition Position of the icon in the badge -- "left", "right", or the empty string
 * @param className Additional classes to apply to the badge
 * @param testid data-testid attribute to apply to the badge
 * @param abbreviatedLabel Text to display when the badge is in abbreviated form
 */
export function PillBadge({
  iconPosition = "",
  className = "",
  testid = "",
  abbreviatedLabel = "",
  children,
}: {
  iconPosition?: "left" | "right" | "";
  className?: string;
  testid?: string;
  abbreviatedLabel?: string;
  children: React.ReactNode;
}) {
  if (abbreviatedLabel) {
    return (
      <AbbreviatedPillBadge
        className={className}
        testid={testid}
        abbreviatedLabel={abbreviatedLabel}
      >
        {children}
      </AbbreviatedPillBadge>
    );
  }

  return (
    <div
      className={`flex h-5 w-fit items-center rounded-full border border-white text-xs font-semibold whitespace-nowrap uppercase ring-1 ${className} ${iconPositionClasses[iconPosition]}`}
      data-testid={testid}
      role="status"
    >
      {children}
    </div>
  );
}
