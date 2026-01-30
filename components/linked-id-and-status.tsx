// components
import Link from "./link-no-prefetch";
import Status from "./status";
// root
import type { DatabaseObject } from "../globals";

/**
 * Display a link to an item's summary page along with its abbreviated status.
 *
 * @param item - Database object to link to and display status for
 * @param status - Status to display instead of the item's own status
 * @param isTargetBlank - True to open the link in a new tab
 * @param className - Additional Tailwind CSS classes for the wrapper div
 */
export default function LinkedIdAndStatus({
  item,
  status = "",
  isTargetBlank = false,
  className = "",
  children,
}: {
  item: DatabaseObject;
  status?: string;
  isTargetBlank?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Link
          href={item["@id"]}
          className="block"
          {...(isTargetBlank
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </Link>
        <Status status={status || item.status} isAbbreviated />
      </div>
    </div>
  );
}
