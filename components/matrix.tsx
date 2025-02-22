// node_modules
import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

/**
 * Styling wrapper for the X- and Y axis labels.
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
