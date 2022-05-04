// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
import { ChevronRightIcon } from "@heroicons/react/solid"
// components
import Status from "./status"

/**
 * Displays an entire collection of items.
 */
export const Collection = ({ children }) => {
  return <>{children}</>
}

export const CollectionItemLink = ({ href, label }) => {
  return (
    <Link href={href}>
      <a
        className="h-fill flex basis-8 items-center justify-center hover:bg-gray-100"
        aria-label={label}
      >
        <ChevronRightIcon className="h-5 w-5 fill-gray-700" />
      </a>
    </Link>
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
    <div className="my-0.5 flex border border-data-background bg-data-background">
      <CollectionItemLink href={href} label={label} />
      <div className="grow p-4">{children}</div>
      <div className="basis-2 justify-end self-center p-2">
        <Status>{status}</Status>
      </div>
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
