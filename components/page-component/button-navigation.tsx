// node_modules
import DOMPurify from "isomorphic-dompurify";
import { ReactNode } from "react";
// components
import Link from "../link-no-prefetch";
import { type PluginProps } from "./types";
// lib
import { isValidPath, isValidUrl } from "../../lib/general";
import MarkdownSection from "../markdown-section";

/**
 * Displays side-by-side (if the browser width allows it) navigation links to other pages or sites.
 * The links are displayed as a grid of buttons, each with required icon, title, and description.
 *
 * Page editors can read ./docs/button-navigation.md for information on how to use this page
 * component.
 *
 * @param items - Object containing navigation items and their associated icons
 */
export default function ButtonNavigation(items: PluginProps) {
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
            const [href, iconSpecs, description] = items[itemTitle].split("|");
            const iconIds = extractIcons(iconSpecs);
            if (!href || !description || iconIds.length === 0) {
              return null;
            }

            // Map the icon IDs to their corresponding SVG strings. If an icon ID does not have a
            // matching SVG, it gets filtered out.
            const iconXmls = iconIds
              .map((iconId) => items[`#${iconId}`] || "")
              .filter(Boolean);

            // Only render items with all properties present.
            if (href && description && iconXmls.length > 0) {
              return (
                <ButtonItem key={itemTitle} href={href} label={itemTitle}>
                  <ButtonContent
                    iconXmls={iconXmls}
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

  // No valid navigation items to display.
  return null;
}

/**
 * Display the contents of a single pad navigation item. The contents include icons, a title, and a
 * description. The icon comprises an SVG string that we render directly.
 *
 * Note: The icons are rendered using `dangerouslySetInnerHTML` because the SVG string may contain
 * complex SVG elements that are difficult to represent in JSX. We ensure that the SVG strings are
 * from a trusted source (the page editor) to mitigate security risks.
 *
 * @param iconXmls - SVG strings for the icons to display above the title
 * @param title - Title for the button
 * @param description - Description of the linked page's contents
 */
function ButtonContent({
  iconXmls,
  title,
  description,
}: {
  iconXmls: string[];
  title: string;
  description: string;
}) {
  return (
    <>
      <div className="flex flex-wrap justify-start">
        {iconXmls.map((iconXml, index) => {
          return (
            <div
              key={index}
              className="h-8 w-8"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(iconXml),
              }}
            />
          );
        })}
      </div>
      <h2 className="text-md my-2 text-lg font-bold">{title}</h2>
      <MarkdownSection className="text-sm">{description}</MarkdownSection>
    </>
  );
}

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
 *
 * @param href - URL or path that the pad should link to when clicked
 * @param label - aria-label for the link, used for screen readers
 */
function ButtonItem({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
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

/**
 * Extracts individual icon IDs from a string that might contain multiple comma-separated IDs
 * enclosed in square brackets, or a single icon ID.
 *
 * @param icons - Icon IDs extracted from page component block
 * @returns Individual icon IDs
 */
function extractIcons(icons?: string): string[] {
  const normalizedIcons = icons?.trim();
  if (!normalizedIcons) {
    // No icons provided; return an empty array.
    return [];
  }

  // Reject mismatched brackets instead of treating the malformed value as an icon ID.
  const startsWithBracket = normalizedIcons.startsWith("[");
  const endsWithBracket = normalizedIcons.endsWith("]");
  if (startsWithBracket !== endsWithBracket) {
    return [];
  }

  // Collect the comma-separated icon IDs from within the brackets. Empty entries indicate malformed
  // content, so reject the entire list.
  if (startsWithBracket && endsWithBracket) {
    const iconIds = normalizedIcons
      .slice(1, -1)
      .split(",")
      .map((icon) => icon.trim());
    return iconIds.every(Boolean) ? iconIds : [];
  }

  // Return the single icon ID as an array.
  return [normalizedIcons];
}
