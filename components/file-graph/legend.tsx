// node_modules
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import { useContext } from "react";
// components
import Icon from "../icon";
import SessionContext from "../session-context";
// local
import { fileSetTypeColorMap } from "./types";
// root
import type { CollectionTitles } from "../../globals.d";

/**
 * Draw the legend to show what colors correspond to each file set type.
 * @param fileSetTypes List of file set types that appear in the graph
 */
export function Legend({ fileSetTypes }: { fileSetTypes: string[] }) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  return (
    <div className="border-t border-data-border py-2">
      <div className="mb-1 flex justify-center gap-1">
        <div className="flex items-center gap-0.5 border border-gray-800 px-1 text-sm dark:border-gray-400">
          <Icon.FileSet className="h-4 w-4" />
          File Set
        </div>
        <div className="flex items-center gap-0.5 border border-gray-800 px-1 text-sm dark:border-gray-400">
          <DocumentTextIcon className="h-4 w-4" />
          File
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {Object.entries(fileSetTypeColorMap).map(([fileSetType, color]) => {
          if (fileSetTypes.includes(fileSetType)) {
            return (
              <div
                key={fileSetType}
                className={`${color.bg} flex items-center gap-0.5 border border-gray-800 px-2 py-0.5 text-xs font-semibold text-black dark:border-gray-400 dark:text-white`}
              >
                {collectionTitles?.[fileSetType] || fileSetType}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
