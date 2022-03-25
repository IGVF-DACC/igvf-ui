// node_modules
import Link from "next/link"
import PropTypes from "prop-types"

/**
 * Displays an entire collection of items.
 */
export const Collection = ({ children }) => {
  return <>{children}</>
}

/**
 * Displays a single item in a collection.
 */
export const CollectionItem = ({ href, children }) => {
  return (
    <Link href={href}>
      <a className="block border-b border-gray-300 p-4 px-2 no-underline last:border-b-0 hover:bg-highlight dark:border-gray-700">
        {children}
      </a>
    </Link>
  )
}

CollectionItem.propTypes = {
  // Path to item this links to
  href: PropTypes.string.isRequired,
}

/**
 * Displays the name of the collection item.
 */
export const CollectionItemName = ({ name }) => {
  return (
    <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
      {name}
    </div>
  )
}

CollectionItemName.propTypes = {
  // Name of collection item
  name: PropTypes.string.isRequired,
}
