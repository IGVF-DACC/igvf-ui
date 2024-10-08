// node_modules
import { ReactNode, useContext } from "react";
// components
import SessionContext from "../session-context";
// root
import type { DatabaseObject } from "../../globals.d";

/**
 * Display the title and object subtype in the file and file-set modals.
 * @param item File or file-set object to display the title for
 */
export function FileModalTitle({
  item,
  children,
}: {
  item: DatabaseObject;
  children: ReactNode;
}) {
  const { collectionTitles } = useContext<any>(SessionContext);
  const fileType = item["@type"][0];

  return (
    <div className="my-[-6px]">
      {children}
      <div className="text-xs font-semibold">
        {collectionTitles?.[fileType] || fileType}
      </div>
    </div>
  );
}
