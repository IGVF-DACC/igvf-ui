// node_modules
import PropTypes from "prop-types"

/**
 * Display the given aliases as a list, suitable for a value in a <DataArea>.
 */
const AliasList = ({ aliases }) => {
  return (
    <>
      {aliases.map((alias) => (
        <div key={alias} className="mb-1.5 break-all">
          {alias}
        </div>
      ))}
    </>
  )
}

AliasList.propTypes = {
  // Aliases to display
  aliases: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default AliasList
