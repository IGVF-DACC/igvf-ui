// node_modules
import { useContext } from "react";
// components
import GlobalContext from "./global-context";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
// lib
import buildBreadcrumbs, {
  type Breadcrumb,
  type BreadcrumbMeta,
} from "../lib/breadcrumbs";
// root
import type {
  DatabaseObject,
  Profiles,
  Schema,
  SearchResults,
} from "../globals";

/**
 * Render a single breadcrumb element. If no `href` provided, the element only displays its title
 * with no link.
 *
 * @param href - URL to navigate to when the breadcrumb is clicked
 * @param className - CSS class to apply to the breadcrumb element
 * @param id - Unique identifier for the breadcrumb element
 */
function BreadcrumbElement({
  href,
  className,
  id,
  children,
}: {
  href?: string;
  className?: string;
  id: string;
  children: React.ReactNode;
}) {
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

/**
 * Static breadcrumb for the home page.
 */
const homeBreadcrumb: Breadcrumb[] = [
  {
    title: "Home",
    href: "/",
  },
];

/**
 * Render a breadcrumb trail for the current page.
 *
 * @param item - Database object for which to render breadcrumbs
 * @param title - Title of the current page or item
 * @param meta - Additional metadata for building the breadcrumb trail
 */
export default function Breadcrumbs({
  item,
  title,
  meta = {},
}: {
  item: DatabaseObject | SearchResults | Schema | Profiles;
  title?: string;
  meta?: BreadcrumbMeta;
}) {
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
          <div className="-mt-0.5 px-2 font-bold text-gray-800 dark:text-gray-200">
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
