// node_modules
import PropTypes from "prop-types";

/**
 * Display a single gene location and assembly.
 */
export const ChromosomeLocation = ({ location, className = null }) => {
  return (
    <div data-testid="chromosome-location" className={className}>
      <span className="whitespace-nowrap">{`${location.chromosome}:${location.start}-${location.end}`}</span>
      <div className="ml-2 bg-gray-300 px-1.5 text-xs font-semibold dark:bg-gray-700">
        {location.assembly}
      </div>
    </div>
  );
};

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
const ChromosomeLocations = ({ locations, className = null }) => {
  return (
    <ul className={className}>
      {locations.map((location, index) => (
        <li key={index} className="[&>div]:flex [&>div]:items-center">
          <ChromosomeLocation location={location} />
        </li>
      ))}
    </ul>
  );
};

ChromosomeLocations.propTypes = {
  // Gene locations to display as defined in the schema
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Tailwind CSS class name to apply to the wrapper around the gene location array display
  className: PropTypes.string,
};

export default ChromosomeLocations;
