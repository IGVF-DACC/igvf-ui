// node_modules
import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { twMerge } from "tailwind-merge";
// components
import Link from "./link-no-prefetch";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";

/**
 * Styling wrapper for the X- and Y axis labels.
 *
 * @param className - Additional classes to apply to the wrapper
 */
function LabelAxisWrapper({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center bg-transparent text-sm font-semibold uppercase ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Display the X-axis label with an arrow pointing to the right.
 *
 * @param label - Text to display as the X-axis label
 */
export function LabelXAxis({ label }: { label: string }) {
  return (
    <LabelAxisWrapper className="ml-6">
      {label}
      <ArrowRightIcon className="block h-4 w-4" />
    </LabelAxisWrapper>
  );
}

/**
 * Display the Y-axis label with an arrow pointing down.
 *
 * @param label - Text to display as the Y-axis label
 */
export function LabelYAxis({ label }: { label: string }) {
  return (
    <LabelAxisWrapper className="py-1 [writing-mode:vertical-rl]">
      {label}
      <ArrowDownIcon className="mt-1 block h-4 w-4" />
    </LabelAxisWrapper>
  );
}

/**
 * Renders a table header cell that contains a link. The link fills the entire header cell.
 *
 * @param href - URL the header cell should link to
 * @param label - Optional label for the link inside the header cell
 * @param tooltipContent - Optional tooltip displayed when the link is hovered or focused
 * @param linkClassName - Additional classes to merge with the link's default classes
 * @param rowSpan - Number of rows the header cell should span
 * @param className - Additional classes to apply to the header cell
 * @param as - HTML element to render the cell as ("td" or "th")
 * @param cellProps - Additional native table-cell attributes forwarded to the rendered cell
 */
export function LinkedTableCell({
  href,
  label,
  tooltipContent,
  linkClassName,
  className,
  as: Cell = "td",
  children,
  ...cellProps
}: {
  href: string;
  label?: string;
  tooltipContent?: React.ReactNode;
  linkClassName?: string;
  as?: "td" | "th";
  children: React.ReactNode;
} & Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "children">) {
  if (tooltipContent) {
    return (
      <LinkedTableCellWithTooltip
        href={href}
        label={label}
        tooltipContent={tooltipContent}
        linkClassName={linkClassName}
        className={className}
        as={Cell}
        {...cellProps}
      >
        {children}
      </LinkedTableCellWithTooltip>
    );
  }

  return (
    <Cell
      {...cellProps}
      className={twMerge(
        "border-matrix-lines relative border-r border-b",
        className
      )}
    >
      <Link
        href={href}
        aria-label={label}
        aria-describedby={
          tooltipContent ? `linked-table-cell-${href}` : undefined
        }
        className={twMerge(
          "block h-full w-full px-2 whitespace-nowrap no-underline after:absolute after:inset-0 after:content-['']",
          linkClassName
        )}
      >
        {children}
      </Link>
    </Cell>
  );
}

/**
 * Renders a table cell that contains a link with an associated tooltip.
 * The link fills the entire cell, and the tooltip is displayed on hover or focus.
 *
 * @param href - URL the cell's link should point to
 * @param label - Optional label for the link
 * @param tooltipContent - Content to display in the tooltip
 * @param linkClassName - Additional classes to merge with the link's default classes
 * @param as - HTML element to render the cell as ("td" or "th")
 * @param children - Content inside the link
 * @param cellProps - Additional native table-cell attributes forwarded to the rendered cell
 */
function LinkedTableCellWithTooltip({
  href,
  label,
  tooltipContent,
  linkClassName,
  className,
  as: Cell = "td",
  children,
  ...cellProps
}: {
  href: string;
  label?: string;
  tooltipContent: React.ReactNode;
  linkClassName?: string;
  as?: "td" | "th";
  children: React.ReactNode;
} & Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "children">) {
  const tooltipAttr = useTooltip(`linked-table-cell-${href}`);

  return (
    <Cell
      {...cellProps}
      className={twMerge(
        "border-matrix-lines relative border-r border-b",
        className
      )}
    >
      <TooltipRef tooltipAttr={tooltipAttr} className="block h-full w-full">
        <Link
          href={href}
          aria-label={label}
          aria-describedby={tooltipAttr.id}
          className={twMerge(
            "block h-full w-full px-2 whitespace-nowrap no-underline after:absolute after:inset-0 after:content-['']",
            linkClassName
          )}
        >
          {children}
        </Link>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{tooltipContent}</Tooltip>
    </Cell>
  );
}
