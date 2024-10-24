// node_modules
import { useContext } from "react";
// components
import GlobalContext from "../global-context";
import SessionContext from "../session-context";
// local
import { fileSetTypeColorMap } from "./types";

/**
 * Draw the legend to show what colors correspond to each file set type.
 * @param fileSetTypes List of file set types that appear in the graph
 */
export function Legend({ fileSetTypes }: { fileSetTypes: string[] }) {
  const { collectionTitles } = useContext<any>(SessionContext);
  const { darkMode } = useContext(GlobalContext);

  return (
    <div className="flex flex-wrap justify-center gap-1 border-t border-data-border py-2">
      {Object.entries(fileSetTypeColorMap).map(([fileSetType, color]) => {
        if (fileSetTypes.includes(fileSetType)) {
          return (
            <div
              key={fileSetType}
              className="flex items-center gap-0.5 border border-gray-800 px-2 py-0.5 text-xs font-semibold text-black dark:border-gray-400 dark:text-white"
              style={{
                backgroundColor: darkMode.enabled ? color.dark : color.light,
              }}
            >
              {collectionTitles?.[fileSetType] || fileSetType}
            </div>
          );
        }
      })}
    </div>
  );
}
