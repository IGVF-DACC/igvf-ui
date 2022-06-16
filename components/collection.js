// node_modules
import {
  ChevronDoubleRightIcon,
  TableIcon,
  ViewListIcon,
} from "@heroicons/react/solid"
import Link from "next/link"
import PropTypes from "prop-types"
import { useContext } from "react"
// components
import Button from "./button"
import GlobalContext from "./global-context"
import Report from "../components/report"
import SortableGrid from "./sortable-grid"
import Status from "./status"
// libs
import reportColumns from "../libs/report-columns"

/**
 * States for the collection view display
 */
export const COLLECTION_VIEW = {
  LIST: "list", // Display as a list
  TABLE: "table", // Display as a table
}

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
export const CollectionItemLink = ({ href, label = "" }) => {
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
  // Voice label for item; treat as required unless you have absolutely nothing
  label: PropTypes.string,
}

/**
 * Displays a single item in a collection.
 */
export const CollectionItem = ({ href, label = "", status = "", children }) => {
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

/**
 *
 */
const flattenCollection = (collection) => {
  const flattenedCollection = collection.map((item) => {
    const flattenedItem = {}
    Object.keys(item).forEach((key) => {
      const propType = typeof item[key]
      if (propType === "object") {
        // Generally, object, array, or null (which is OK to stringify to 'null').
        flattenedItem[key] = JSON.stringify(item[key])
      } else if (propType !== "function" && propType !== "undefined") {
        // Generally, any simple value.
        flattenedItem[key] = item[key]
      }
      // Anything else (function, undefined) is ignored.
    })
    return flattenedItem
  })
  return flattenedCollection
}

/**
 * Display the buttons to view the collection as a table or list.
 */
export const CollectionViewSwitch = () => {
  const { currentCollectionView } = useContext(GlobalContext)

  return (
    <div className="flex gap-1 pb-2">
      <Button.Icon
        type="info"
        onClick={() =>
          currentCollectionView.setCollectionView(COLLECTION_VIEW.LIST)
        }
      >
        <ViewListIcon />
      </Button.Icon>
      <Button.Icon
        type="info"
        onClick={() =>
          currentCollectionView.setCollectionView(COLLECTION_VIEW.TABLE)
        }
      >
        <TableIcon />
      </Button.Icon>
    </div>
  )
}

/**
 * Displays information above the collection display.
 */
export const CollectionHeader = ({ count }) => {
  return (
    <div className="flex justify-between">
      <CollectionCount count={count} />
      <CollectionViewSwitch />
    </div>
  )
}

CollectionHeader.propTypes = {
  // Number of items in the collection
  count: PropTypes.number.isRequired,
}

/**
 * Display either a list or report view of the collection. For a list, the `children` provides the
 * content. For the report view, the content comes from this use of the `Report` component.
 */
export const CollectionContent = ({ collection, children }) => {
  // Collection view setting and /profiles content
  const { currentCollectionView, profiles } = useContext(GlobalContext)

  if (currentCollectionView.collectionView === COLLECTION_VIEW.LIST) {
    // Display list view.
    return <>{children}</>
  }

  if (
    currentCollectionView.collectionView === COLLECTION_VIEW.TABLE &&
    profiles
  ) {
    // Display report view.
    const flattenedCollection = flattenCollection(collection)
    const collectionType = collection[0]?.["@type"][0] || ""
    if (collectionType) {
      const columns = reportColumns(profiles[collectionType])
      return (
        <>
          <Report>
            <SortableGrid data={flattenedCollection} columns={columns} />
          </Report>
        </>
      )
    }
  }

  return null
}

CollectionContent.propTypes = {
  // Collection of items to display
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
}
