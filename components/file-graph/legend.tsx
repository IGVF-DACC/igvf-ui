// node_modules
import { useContext } from "react";
// components
import SessionContext from "../session-context";
// local
import { fileSetTypeColorMap, type FileSetStats } from "./types";
// root
import type { CollectionTitles } from "../../globals.d";

/**
 * Draw the legend to show what colors correspond to each file-set type.
 *
 * @param fileSetTypes - List of file set types that appear in the graph
 */
export function Legend({
  fileSetStats,
  fileCount,
}: {
  fileSetStats: FileSetStats;
  fileCount: number;
}) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  return (
    <div className="border-data-border border-t py-2">
      <div className="flex flex-wrap justify-center gap-1">
        {Object.entries(fileSetStats).map(([fileSetType, count]) => {
          const color =
            fileSetTypeColorMap[fileSetType] || fileSetTypeColorMap.unknown;
          return (
            <div
              key={fileSetType}
              className={`flex rounded-full border text-xs font-semibold ${color.border}`}
            >
              <div
                className={`${color.bg} flex items-center justify-center rounded-tl-full rounded-bl-full py-0.5 pr-1 pl-1.5`}
              >
                {collectionTitles?.[fileSetType] || fileSetType}
              </div>
              <div
                className={`${color.bgCount} flex h-full min-w-4 items-center justify-center rounded-tr-full rounded-br-full bg-black px-1.5 text-white`}
              >
                {count}
              </div>
            </div>
          );
        })}
        <div className="border-file-graph-file flex border text-xs font-semibold">
          <div className="bg-file-graph-file items center flex py-0.5 pr-1 pl-1.5">
            Files
          </div>
          <div className="bg-file-graph-file-count flex h-full min-w-4 items-center justify-center px-1.5 text-white">
            {fileCount}
          </div>
        </div>
      </div>
    </div>
  );
}
