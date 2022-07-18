// node_modules
import Link from "next/link"

/**
 * Generate a list of report columns for the sortable grid.
 * @param {object} profile Profile for one DB object type
 * @returns {object} Sortable grid columns
 */
const reportColumns = (profile) => {
  return Object.keys(profile.properties).map((key, index) => {
    if (index === 0) {
      // First column is a link to the item.
      return {
        id: "link",
        title: "@id",
        display: ({ source }) => {
          return (
            <Link href={source["@id"]}>
              <a>{source["@id"]}</a>
            </Link>
          )
        },
      }
    }
    return {
      id: key,
      title: profile.properties[key].title,
    }
  })
}

export default reportColumns
