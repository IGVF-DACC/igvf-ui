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
export function Legend({ stats }: { stats: FileSetStats }) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  return (
    <div className="border-data-border border-t py-2">
      <div className="mb-1 flex justify-center gap-1">
        <div className="border-file-graph-analysis bg-file-graph-analysis items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase">
          File Set
        </div>
        <div className="bg-file-graph-file border-file-graph-file items-center border px-2 py-0.5 text-xs font-bold uppercase">
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
      </div>
    </div>
  );
}
