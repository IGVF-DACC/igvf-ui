// node_modules
import DOMPurify from "isomorphic-dompurify";
import PropTypes from "prop-types";
// components
import Link from "../link-no-prefetch";
// lib
import { isValidPath, isValidUrl } from "../../lib/general";
import MarkdownSection from "../markdown-section";

/**
 * Display the contents of a single pad navigation item. The contents include an icon, title, and
 * description. The icon comprises an SVG string that we sanitize to remove potentially dangerous
 * Javascript before rendering.
 */
function ButtonContent({ icon, title, description }) {
  const sanitizedSvg = DOMPurify.sanitize(icon);

  return (
    <>
      <div
        className="h-8 w-8"
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
      />
      <h2 className="text-md my-2 text-lg font-bold">{title}</h2>
      <MarkdownSection className="text-sm">{description}</MarkdownSection>
    </>
  );
}

ButtonContent.propTypes = {
  // ID of the icon to display above the title
  icon: PropTypes.string.isRequired,
  // Title for the button
  title: PropTypes.string.isRequired,
  // Description of the linked page's contents
  description: PropTypes.string.isRequired,
};

/**
 * Tailwind CSS classes for the pad links.
 */
const linkClasses =
  "block h-full rounded-lg border border-panel bg-white p-2 no-underline dark:bg-black";

/**
 * Displays a single linked navigation pad item. The form of the link depends on the href value:
 *
 * - If href is a valid URL, the link is an anchor tag.
 * - If href is a valid path, the link is a Next.js link.
 * - Otherwise, you just get an unlinked pad.
 *
 * The last case serves as a fallback for when the page editor accidentally uses a bad href value.
 * They should fix this in the editor before releasing the page publicly.
 *
 * See ./docs/button-navigation.md for more information.
 */
function ButtonItem({ href, label, children }) {
  return (
    <li className="my-3 p-0 drop-shadow-none transition ease-in-out first:mt-0 last:mb-0 hover:scale-105 hover:drop-shadow-md @lg:m-0">
      {isValidUrl(href) ? (
        <a
          href={href}
          aria-label={label}
          className={linkClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ) : isValidPath(href) ? (
        <Link href={href} aria-label={label} className={linkClasses}>
          {children}
        </Link>
      ) : (
        <div className={linkClasses}>{children}</div>
      )}
    </li>
  );
}

ButtonItem.propTypes = {
  // URI to link to
  href: PropTypes.string.isRequired,
  // Screen reader label for the button; usually button's title
  label: PropTypes.string.isRequired,
};

/**
 * Displays side-by-side (if the browser width allows it) navigation links to other pages or sites.
 * The links are displayed as a grid of buttons, each with required icon, title, and description.
 *
 * Page editors can read ./docs/pad-navigation.md for information on how to use this page component.
 */
export default function ButtonNavigation(items) {
  // filter out any items starting with a #; those represent icon identifiers.
  const itemTitles = Object.keys(items).filter(
    (itemTitle) => !itemTitle.startsWith("#")
  );
  if (itemTitles.length > 0) {
    return (
      <nav data-testid="pad-navigation" className="@container">
        <ul className="list-none p-0 @lg:grid @lg:grid-cols-2 @lg:gap-3 @3xl:grid-cols-3">
          {itemTitles.map((itemTitle) => {
            // The icon from the item contains the icon identifier, which the page editor uses to
            // reference the icon SVG as a separate item starting with a "#" within `items`.
            const [href, icon, description] = items[itemTitle].split("|");
            const iconXml = items[`#${icon}`] || "";

            // Only render items with all properties present.
            if (href && description && iconXml) {
              return (
                <ButtonItem key={itemTitle} href={href} label={itemTitle}>
                  <ButtonContent
                    icon={iconXml}
                    title={itemTitle}
                    description={description}
                  />
                </ButtonItem>
              );
            }

            // Malformed pad navigation item; skip it.
            return null;
          })}
        </ul>
      </nav>
    );
  }
  return null;
}
