// node_modules
import { ReactNode } from "react";
// lib
import { isLight } from "../../lib/color";
import { PluginProps } from "./types";

/**
 * Displays a single chevron link in the chevron navigation menu. The `color` prop is the CSS hex
 * color to use for the chevron background. The text that appears within the chevron is this
 * component's children. styles/globals.css defines the chevron shape.
 *
 * @param href - URL that the chevron should link to when clicked
 * @param color - CSS hex color for the background of the chevron link
 */
function ChevronLink({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: ReactNode;
}) {
  const textColor = isLight(color) ? "#000000" : "#ffffff";

  return (
    <li className="-mx-3.5 my-0 flex grow basis-0">
      <a
        href={href}
        className="chevron-shape flex h-14 w-full min-w-25 items-center bg-black px-7 text-xs no-underline @lg/chevronMenu:text-sm @4xl/chevronMenu:text-base"
        style={{ color: textColor, backgroundColor: color }}
      >
        {children}
      </a>
    </li>
  );
}

/**
 * Displays a horizontal navigation bar in which each link looks like a sideways chevron. It's
 * similar to the PAGE_NAV page component, except for the appearance. `items` is a variable-sized
 * object where each key is a title for each navigation link, and each value is the link itself,
 * a pipe character, and then a hex color for the background of the link without the # character.
 *
 * See ./docs/chevron-navigation.md for more information.
 */
export default function ChevronNavigation(items: PluginProps) {
  const itemTitles = Object.keys(items);
  if (itemTitles.length > 0) {
    return (
      <nav data-testid="chevron-navigation">
        <ul className="@container/chevron-menu flex flex-wrap gap-1 overflow-hidden px-4">
          {itemTitles.map((itemTitle, index) => {
            // Get the link and color for the title, separated by a pipe character
            const [href, color] = items[itemTitle].split("|");
            return (
              <ChevronLink key={index} href={href} color={`#${color}`}>
                {itemTitle}
              </ChevronLink>
            );
          })}
        </ul>
      </nav>
    );
  }
  return null;
}
