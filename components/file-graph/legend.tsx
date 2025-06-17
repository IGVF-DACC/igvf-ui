// node_modules
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import { useContext } from "react";
// components
import Icon from "../icon";
import SessionContext from "../session-context";
// local
import { fileSetTypeColorMap, type FileSetStats } from "./types";
// root
import type { CollectionTitles } from "../../globals.d";

/**
 * Draw the legend to show what colors correspond to each file set type.
 * @param fileSetTypes List of file set types that appear in the graph
 */
export function Legend({ stats }: { stats: FileSetStats }) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  return (
    <div className="border-data-border border-t py-2">
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
        {Object.entries(stats).map(([fileSetType, count]) => {
          const color =
            fileSetTypeColorMap[fileSetType] || fileSetTypeColorMap.unknown;
          return (
            <div
              key={fileSetType}
              className="flex border border-gray-800 text-xs font-semibold text-black dark:border-gray-400 dark:text-white"
            >
              <div
                className={`${color.bg} flex items-center justify-center px-1 py-0.5`}
              >
                {collectionTitles?.[fileSetType] || fileSetType}
              </div>
              <div
                className={`${color.bgCount} flex h-full min-w-4 items-center justify-center bg-black px-1.5 text-white`}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
