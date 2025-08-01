// components
import Link from "../link-no-prefetch";
// lib
import { isValidUrl } from "../../lib/general";

/**
 * Displays a horizontal navigation bar with links to other pages, other website pages, or anchors
 * on the same page. `items` is a variable-sized object where each key is a title for each
 * navigation link, and each value is the link itself. Technically, these could appear in any
 * order, but practically the keys appear in the same order the page editor entered them.
 *
 * See ./docs/page-navigation.md for more information.
 */
export default function PageNavigation(items) {
  // Get the titles of each link the page editor has entered.
  const itemTitles = Object.keys(items);
  if (itemTitles.length > 0) {
    const className =
      "rounded-full border border-transparent px-4 py-1 no-underline hover:border-nav-border hover:bg-nav-highlight";
    return (
      <nav className="text-center">
        <ul className="mb-12 mt-4 inline-flex list-none flex-wrap justify-center border-b border-gray-200 px-0 dark:border-gray-700">
          {itemTitles.map((itemTitle, index) => {
            const href = items[itemTitle];
            const isUrl = isValidUrl(href);
            const isAnchor = href.startsWith("#");

            // External links and anchors get a regular <a> while internal links get a <Link> so
            // that they only load JSON data instead of the page's HTML. Using an array index as
            // key isn't ideal, but it provides the only unique identifier we have.
            return (
              <li key={index} className="m-0 p-0 pb-2">
                {isUrl || isAnchor ? (
                  <a data-testid="external" href={href} className={className}>
                    {itemTitle}
                  </a>
                ) : (
                  <Link
                    data-testid="internal"
                    href={href}
                    className={className}
                  >
                    {itemTitle}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
  return null;
}
