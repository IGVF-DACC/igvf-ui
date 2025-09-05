// node_modules
import PropTypes from "prop-types";
// lib
import { isLight } from "../../lib/color";

/**
 * Displays a single chevron link in the chevron navigation menu. The `color` prop is the CSS hex
 * color to use for the chevron background. The text that appears within the chevron is this
 * component's children. styles/globals.css defines the chevron shape.
 */
function ChevronLink({ href, color, children }) {
  const textColor = isLight(color) ? "#000000" : "#ffffff";

  return (
    <li className="mx-[-14px] my-0 flex grow basis-0">
      <a
        href={href}
        className="chevron-shape flex h-14 w-full min-w-[100px] items-center bg-black px-7 text-xs no-underline @lg/chevronMenu:text-sm @4xl/chevronMenu:text-base"
        style={{ color: textColor, backgroundColor: color }}
      >
        {children}
      </a>
    </li>
  );
}

ChevronLink.propTypes = {
  // URI to link to
  href: PropTypes.string.isRequired,
  // CSS hex color to use for the chevron background, including the #
  color: PropTypes.string.isRequired,
};

/**
 * Displays a horizontal navigation bar in which each link looks like a sideways chevron. It's
 * similar to the PAGE_NAV page component, except for the appearance. `items` is a variable-sized
 * object where each key is a title for each navigation link, and each value is the link itself,
 * a pipe character, and then a hex color for the background of the link without the # character.
 *
 * See ./docs/chevron-navigation.md for more information.
 */
export default function ChevronNavigation(items) {
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
