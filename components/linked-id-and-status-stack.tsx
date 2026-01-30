// components
import LinkedIdAndStatus from "./linked-id-and-status";
// root
import type { DatabaseObject } from "../globals";

/**
 * Displays a stack of linked IDs and their statuses.
 *
 * @param items - Array of database objects to display
 * @param className - Additional Tailwind CSS classes for the wrapper div
 * @param children - Function that returns React nodes to render within each LinkedIdAndStatus
 */
export default function LinkedIdAndStatusStack<T extends DatabaseObject>({
  items,
  className = "",
  children,
}: {
  items: T[];
  className?: string;
  children: (item: T) => React.ReactNode;
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <LinkedIdAndStatus
          key={item["@id"]}
          item={item}
          className="my-1 first:mt-0 last:mb-0"
        >
          {children(item)}
        </LinkedIdAndStatus>
      ))}
    </div>
  );
}
