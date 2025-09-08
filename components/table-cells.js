/**
 * Use this module for components to display cells in a table or the report view. Use this mostly
 * to reduce code duplication for more complex cells.
 */

// node_modules
import PropTypes from "prop-types";

/**
 * Display a vertical list of aliases and allow it to break on any character to avoid making an
 * unreasonably wide column. It seems unlikely that a cell would have so many aliases that it
 * needs a collapse/expand button.
 */
export function AliasesCell({ source }) {
  if (source.aliases?.length > 0) {
    return (
      <ul className="max-w-80 min-w-48 break-all">
        {source.aliases.map((alias) => (
          <li
            key={alias}
            data-testid="cell-type-aliases"
            className="my-2 first:mt-0 last:mb-0"
          >
            {alias}
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

AliasesCell.propTypes = {
  // Object displayed in a row
  source: PropTypes.shape({
    // Array of aliases
    aliases: PropTypes.arrayOf(PropTypes.string),
  }),
};
