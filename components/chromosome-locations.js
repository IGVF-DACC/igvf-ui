// node_modules
import PropTypes from "prop-types";
// components
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "./collapse-control";

/**
 * Display a single gene location and assembly.
 */
export function ChromosomeLocation({ location, className = null }) {
  return (
    <div data-testid="chromosome-location" className={className}>
      <span className="whitespace-nowrap">{`${location.chromosome}:${location.start}-${location.end}`}</span>
      <span className="ml-2 bg-gray-300 px-1.5 text-xs font-semibold dark:bg-gray-700">
        {location.assembly}
      </span>
    </div>
  );
}

ChromosomeLocation.propTypes = {
  // Gene location to display as defined in the schema
  location: PropTypes.shape({
    chromosome: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    assembly: PropTypes.string.isRequired,
  }),
  // Tailwind CSS class name to apply to the wrapper around the gene location display
  className: PropTypes.string,
};

/**
 * Display an array of gene locations and assemblies.
 */
export default function ChromosomeLocations({
  locations,
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  className = null,
  testid = null,
}) {
  const collapser = useCollapseControl(
    locations,
    isCollapsible,
    maxItemsBeforeCollapse
  );

  return (
    <div>
      <ul className={className} data-testid={testid}>
        {collapser.items.map((location, index) => (
          <li key={index} className="[&>div]:flex [&>div]:items-center">
            <ChromosomeLocation location={location} />
          </li>
        ))}
      </ul>
      {collapser.isCollapseControlVisible && (
        <CollapseControlVertical
          length={locations.length}
          isCollapsed={collapser.isCollapsed}
          setIsCollapsed={collapser.setIsCollapsed}
        />
      )}
    </div>
  );
}

ChromosomeLocations.propTypes = {
  // Gene locations to display as defined in the schema
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  // True if the list should be collapsible
  isCollapsible: PropTypes.bool,
  // Maximum number of items before the list appears collapsed
  maxItemsBeforeCollapse: PropTypes.number,
  // Tailwind CSS class name to apply to the wrapper around the gene location array display
  className: PropTypes.string,
  // Test ID for wrapper element
  testid: PropTypes.string,
};
