// node_modules
import Link from "next/link";
import { PropTypes } from "prop-types";
import { useContext } from "react";
// components
import GlobalContext from "./global-context";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
// lib
import { REPLACE_TYPE } from "../lib/breadcrumbs";

/**
 * Render a single breadcrumb element. If no `href` provided, the element only displays its title
 * with no link.
 */
const BreadcrumbElement = ({ href = "", className, id, children }) => {
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
 * Handle special cases with breadcrumbs. Currently this only handles the `REPLACE_TYPE` operation
 * to replace a breadcrumb title with a schema profile title so that breadcrumbs appear as "Human
 * Donor" instead of "HumanDonor." Server code has no access to schema profiles so it can't do that
 * mapping itself.
 * @param {array} breadcrumbs Breadcrumb object from server
 * @param {object} profiles All schema profiles
 * @returns {array} Copy of breadcrumb array altered with any special
 */
const processBreadcrumbs = (breadcrumbs, profiles) => {
  return breadcrumbs.map((breadcrumb) => {
    if (breadcrumb.operation === REPLACE_TYPE) {
      const mappedTitle = profiles ? profiles[breadcrumb.title]?.title : "";
      return {
        title: mappedTitle || breadcrumb.title,
        href: breadcrumb.href,
      };
    }
    return breadcrumb;
  });
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
  const { profiles } = useContext(SessionContext);

  const processedBreadcrumbs = processBreadcrumbs(breadcrumbs, profiles);

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
        {homeBreadcrumb
          .concat(processedBreadcrumbs)
          .map((breadcrumb, index) => {
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
