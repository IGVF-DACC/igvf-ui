// node_modules
import Link from "next/link"
import { PropTypes } from "prop-types"
import { useContext } from "react"
// components
import GlobalContext from "./global-context"
import SeparatedList from "./separated-list"

/**
 * Render a single breadcrumb element. If no `href` provided, the element only displays its title
 * with no link.
 */
const BreadcrumbElement = ({ href = "", className = "", children }) => {
  // For all but the last element...
  if (href) {
    return (
      <Link href={href}>
        <a className={className}>{children}</a>
      </Link>
    )
  }

  // Last element doesn't have a link.
  return (
    <div className={`${className} text-gray-400 dark:text-gray-600`}>
      {children}
    </div>
  )
}

BreadcrumbElement.propTypes = {
  // Link to navigate to
  href: PropTypes.string,
  // Class name to apply to the element; last element displayed in a specific color
  className: PropTypes.string,
}

/**
 * Static breadcrumb for the home page.
 */
const homeBreadcrumbContext = [
  {
    title: "Home",
    href: "/",
  },
]

/**
 * Render a breadcrumb trail for the current page.
 */
const Breadcrumbs = () => {
  const { breadcrumbContext } = useContext(GlobalContext)

  return (
    <SeparatedList
      className="mb-4 flex items-center text-xs"
      separator={
        <div className="mt-[-2px] px-2 font-bold text-gray-800 dark:text-gray-200">
          /
        </div>
      }
    >
      {homeBreadcrumbContext
        .concat(breadcrumbContext)
        .map((breadcrumb, index) => {
          return (
            <BreadcrumbElement
              key={index}
              href={index < breadcrumbContext.length ? breadcrumb.href : null}
              className="block font-bold uppercase text-gray-600 no-underline dark:text-gray-400"
            >
              {breadcrumb.title}
            </BreadcrumbElement>
          )
        })}
    </SeparatedList>
  )
}

export default Breadcrumbs
