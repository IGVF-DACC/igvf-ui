// node_modules
import { ChevronDoubleRightIcon } from "@heroicons/react/solid"
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Status from "./status"

/**
 * Displays the number of items in a collection.
 */
export const CollectionCount = ({ count }) => {
  if (count > 0) {
    return (
      <div>
        {count} item{count === 1 ? "" : "s"}
      </div>
    )
  }
  return null
}

CollectionCount.propTypes = {
  // Number of items in the collection
  count: PropTypes.number.isRequired,
}

/**
 * Displays an entire collection of items.
 */
export const Collection = ({ children }) => {
  return <div className="overflow-hidden">{children}</div>
}

/**
 * Displays the link in a collection item.
 */
export const CollectionItemLink = ({ href, label }) => {
  return (
    <div className="h-fill flex items-center justify-center pl-2">
      <Link href={href}>
        <a
          className="rounded-full border border-transparent p-2 hover:border-highlight-border hover:bg-highlight"
          aria-label={label}
        >
          <ChevronDoubleRightIcon className="h-5 w-5 fill-gray-700 dark:fill-gray-300" />
        </a>
      </Link>
    </div>
  )
}

CollectionItemLink.propTypes = {
  // Path to item this links to
  href: PropTypes.string.isRequired,
  // Voice label for item
  label: PropTypes.string.isRequired,
}

/**
 * Displays a single item in a collection.
 */
export const CollectionItem = ({ href, label, status = "", children }) => {
  return (
    <div className="my-0.5 flex border border-data-border bg-data-background">
      <CollectionItemLink href={href} label={label} />
      <div className="grow p-4">{children}</div>
      {status && (
        <div className="shrink justify-end self-center p-2">
          <Status status={status} />
        </div>
      )}
    </div>
  )
}

CollectionItem.propTypes = {
  // Path to item this links to
  href: PropTypes.string.isRequired,
  // Voice label for item
  label: PropTypes.string,
  // Status of item
  status: PropTypes.string,
}

/**
 * Displays the name of the collection item.
 */
export const CollectionItemName = ({ children }) => {
  return (
    <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
      {children}
    </div>
  )
}
