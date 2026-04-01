// node_modules
import { twMerge } from "tailwind-merge";
// components
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "./collapse-control";
// lib
import { sortGeneLocations, type GeneLocation } from "../lib/genes";

/**
 * Display a single gene location and assembly.
 *
 * @param location - Chromosomal region to display
 * @param className - Tailwind class names to apply to the wrapper around the gene location display
 */
export function ChromosomeLocation({
  location,
  className = "",
}: {
  location: GeneLocation;
  className?: string;
}) {
  return (
    <div
      data-testid="chromosome-location"
      className={twMerge(
        "flex flex-wrap items-center gap-x-1.5 gap-y-0 leading-none",
        className
      )}
    >
      <div className="bg-gray-300 px-1 text-xs font-semibold dark:bg-gray-600">
        {location.assembly}
      </div>
      <div className="bg-gray-200 px-1 font-mono text-xs whitespace-nowrap dark:bg-gray-700">{`${location.chromosome}:${location.start}-${location.end}`}</div>
      {location.name && <div className="text-sm">{location.name}</div>}
    </div>
  );
}

/**
 * Display an array of gene locations and assemblies.
 *
 * @param locations - Array of chromosomal regions to display
 * @param isCollapsible - True if the list should be collapsible
 * @param maxItemsBeforeCollapse - Maximum number of items before the list appears collapsed
 * @param className - Tailwind class names to apply to the wrapper around the gene location array display
 * @param testid - Test ID for wrapper element
 */
export default function ChromosomeLocations({
  locations,
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  className,
  testid,
}: {
  locations: GeneLocation[];
  isCollapsible?: boolean;
  maxItemsBeforeCollapse?: number;
  className?: string;
  testid?: string;
}) {
  const sortedLocations = sortGeneLocations(locations);

  const collapser = useCollapseControl(
    sortedLocations,
    maxItemsBeforeCollapse,
    isCollapsible
  );

  return (
    <div>
      <ul className={className} data-testid={testid}>
        {collapser.items.map((location, index) => (
          <li key={index} className="my-1.5">
            <ChromosomeLocation location={location} />
          </li>
        ))}
      </ul>
      {collapser.isCollapseControlVisible && (
        <CollapseControlVertical
          length={sortedLocations.length}
          isCollapsed={collapser.isCollapsed}
          setIsCollapsed={collapser.setIsCollapsed}
        />
      )}
    </div>
  );
}
