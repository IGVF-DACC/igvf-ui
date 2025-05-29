// node_modules
import { PropTypes } from "prop-types";
import { useContext } from "react";
// components
import GlobalContext from "./global-context";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
// lib
import buildBreadcrumbs from "../lib/breadcrumbs";

/**
 * Render a single breadcrumb element. If no `href` provided, the element only displays its title
 * with no link.
 */
function BreadcrumbElement({ href = "", className, id, children }) {
  // For all but the last element...
  if (href) {
    return (
      <Link
        href={href}
        className={`${className} text-gray-600 dark:text-gray-400`}
        data-testid={id}
      >
        {children}
      </Link>
    );
  }

  // Last element doesn't have a link.
  return (
    <div
      data-testid={id}
      className={`${className} text-gray-400 dark:text-gray-600`}
    >
      {children}
    </div>
  );
}

BreadcrumbElement.propTypes = {
  // Link to navigate to
  href: PropTypes.string,
  // Class name to apply to the element; last element displayed in a specific color
  className: PropTypes.string.isRequired,
  // Unique ID within the breadcrumb trail
  id: PropTypes.string.isRequired,
};

/**
 * Static breadcrumb for the home page.
 */
const homeBreadcrumb = [
  {
    title: "Home",
    href: "/",
  },
];

/**
 * Render a breadcrumb trail for the current page.
 */
export default function Breadcrumbs({ item, title = "", meta = {} }) {
  const { page } = useContext(GlobalContext);
  const { collectionTitles, sessionProperties } = useContext(SessionContext);

  // Merge the authenticated state and admin status into the metadata.
  const metaWithAdmin = {
    ...meta,
    isAdmin: Boolean(sessionProperties?.admin),
  };
  const breadcrumbs = buildBreadcrumbs(
    item,
    title || page.title,
    metaWithAdmin,
    collectionTitles
  );

  return (
    <nav aria-label="breadcrumbs">
      <SeparatedList
        className="mb-4 flex items-center text-xs"
        separator={
          <div className="mt-[-2px] px-2 font-bold text-gray-800 dark:text-gray-200">
            /
          </div>
        }
      >
        {homeBreadcrumb.concat(breadcrumbs).map((breadcrumb, index) => {
          return (
            <BreadcrumbElement
              key={index}
              id={`breadcrumb-${index}`}
              href={breadcrumb.href}
              className="block font-bold uppercase no-underline"
            >
              {breadcrumb.title}
            </BreadcrumbElement>
          );
        })}
      </SeparatedList>
    </nav>
  );
}

Breadcrumbs.propTypes = {
  // Item to display breadcrumbs for
  item: PropTypes.object.isRequired,
  // Title of the item if not from pageProps.title
  title: PropTypes.string,
  // Metadata about the item
  meta: PropTypes.object,
};
