// node_modules
import PropTypes from "prop-types";

/**
 * Display the given aliases as a list, suitable for a value in a <DataArea>.
 */
export default function AliasList({ aliases }) {
  return (
    <div>
      {aliases.map((alias) => (
        <div key={alias} className="my-2 break-all first:mt-0 last:mb-0">
          {alias}
        </div>
      ))}
    </div>
  );
}

AliasList.propTypes = {
  // Aliases to display
  aliases: PropTypes.arrayOf(PropTypes.string).isRequired,
};
