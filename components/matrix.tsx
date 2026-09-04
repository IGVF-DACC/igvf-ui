// node_modules
import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { twMerge } from "tailwind-merge";
// components
import Link from "./link-no-prefetch";

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
 * @param rowSpan - Number of rows the header cell should span
 * @param className - Additional classes to apply to the header cell
 * @param as - HTML element to render the cell as ("td" or "th")
 * @param cellProps - Additional native table-cell attributes forwarded to the rendered cell
 */
export function LinkedTableCell({
  href,
  className,
  as: Cell = "td",
  children,
  ...cellProps
}: {
  href: string;
  as?: "td" | "th";
  children: React.ReactNode;
} & Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "children">) {
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
        className="block h-full w-full px-2 text-left whitespace-nowrap no-underline after:absolute after:inset-0 after:content-['']"
      >
        {children}
      </Link>
    </Cell>
  );
}
