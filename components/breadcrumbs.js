// node_modules
import Link from "next/link";
import { PropTypes } from "prop-types";
import { useContext } from "react";
// components
import GlobalContext from "./global-context";
import SeparatedList from "./separated-list";

/**
 * Render a single breadcrumb element. If no `href` provided, the element only displays its title
 * with no link.
 */
const BreadcrumbElement = ({ href = "", className, id, children }) => {
  // For all but the last element...
  if (href) {
    return (
      <Link href={href}>
        <a
          data-testid={id}
          className={`${className} text-gray-600 dark:text-gray-400`}
        >
          {children}
        </a>
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
};

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
const Breadcrumbs = () => {
  const { breadcrumbs } = useContext(GlobalContext);

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
              key={breadcrumb.href}
              id={breadcrumb.href}
              href={index < breadcrumbs.length ? breadcrumb.href : undefined}
              className="block font-bold uppercase no-underline"
            >
              {breadcrumb.title}
            </BreadcrumbElement>
          );
        })}
      </SeparatedList>
    </nav>
  );
};

export default Breadcrumbs;
