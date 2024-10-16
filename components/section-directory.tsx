// node_modules
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useEffect, useState } from "react";
// components
import Icon from "./icon";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * Scroll offset; amount to lower the scroll position when scrolling to a section to account for
 * the sticky header height.
 */
const SCROLL_OFFSET = 40;

/**
 * Section anchor highlight time in milliseconds. This is the time to add a CSS class to the
 * selected section so it appears highlighted for a short time. Remove this class after this time
 * period has expired.
 */
const ANCHOR_HIGHLIGHT_TIME = 2000;

/**
 * Section directory item that's part of a list of sections on the page to display in a dropdown
 * menu.
 */
type SectionItem = {
  /** ID of the DOM element targeted by the section directory */
  id: string;
  /** Title to show in the section directory menu for this target */
  title: string;
};

/**
 * React component to render each item in the section directory menu. This allows you to customize
 * the appearance of each item in the menu.
 */
type RendererComponent = React.ComponentType<{
  section: SectionItem;
  allSections: SectionItem[];
}>;

/**
 * List of sections to display in the section directory.
 */
type SectionList = {
  items: SectionItem[];
  renderer?: RendererComponent;
};

/**
 * Prefix for section directory IDs to use on DOM elements.
 */
const SEC_DIR_ID_PREFIX = "sec-dir";

/**
 * Pages with section directories call this function to generate the ID to use on any JSX elements
 * on the page you use as a target of the section directory.
 * @param id Unique ID on the page to add to the section directory prefix
 * @returns ID with the section directory prefix
 */
export function secDirId(id: string): string {
  return `${SEC_DIR_ID_PREFIX}-${toShishkebabCase(id)}`;
}

/**
 * Click handler when the user selects a section to scroll to. It also closes the section-directory
 * menu.
 * @param e Click event on the section-directory menu item
 * @param close Function to close the section-directory menu
 */
function handleSelect(
  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  close: () => void
): void {
  close();
  e.preventDefault();

  // Get the anchor string from the href attribute of the clicked element.
  const id = e.currentTarget.getAttribute("href");
  const element = document.querySelector(id);

  // Offset the position of the element to scroll to, allowing for the height of the sticky header.
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  // Add a CSS class to the element to highlight it when scrolling to it. After a short time,
  // remove it.
  element.classList.add("section-directory-highlight");
  setTimeout(() => {
    element.classList.remove("section-directory-highlight");
  }, ANCHOR_HIGHLIGHT_TIME);
}

/**
 * Displays the section directory trigger as well as its dropdown menu.
 * @param sections List of sections to display in the section directory
 */
export function SecDir({ sections }: { sections: SectionList }) {
  const ItemRenderer = sections.renderer;

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open, close }) => (
        <>
          <MenuButton
            className="flex justify-center rounded-t-sm bg-menu-trigger p-1 data-[hover]:bg-menu-trigger-hover data-[open]:bg-menu-trigger-open"
            aria-label="Open section directory menu"
            aria-expanded={open}
          >
            <Icon.SectionDirectory className="h-5 w-5" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            className="z-20 rounded-b-lg border border-menu-items bg-menu-items shadow-lg"
          >
            {sections.items.map((section) => (
              <MenuItem key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleSelect(e, close)}
                  className="block px-4 py-0.5 text-sm font-medium text-menu-item no-underline hover:bg-menu-item-hover hover:text-menu-item-hover data-[focus]:bg-menu-item-hover data-[focus]:text-menu-item-hover"
                >
                  {ItemRenderer ? (
                    <ItemRenderer
                      section={section}
                      allSections={sections.items}
                    />
                  ) : (
                    <>{section.title}</>
                  )}
                </a>
              </MenuItem>
            ))}
          </MenuItems>
        </>
      )}
    </Menu>
  );
}

/**
 * Custom hook to include on pages that have a section directory. Extracts the sections from the
 * page and returns them as a list of section items. The first time this gets called at render, it
 * could return an empty array. This updates to the real list once the page has rendered.
 * @param renderer React component to render each item in the section directory menu
 * @returns List of sections on the page to pass to SecDir
 */
export function useSecDir(renderer?: RendererComponent): SectionList {
  const [sections, setSections] = useState<SectionList>(null);

  useEffect(() => {
    // Get all elements on the page with a section directory ID prefix.
    const extractedSections = document.querySelectorAll(
      `[id^="${SEC_DIR_ID_PREFIX}-"]`
    );

    // Extract the ID and title of each section to build a list of sections that the directory can
    // use.
    const sectionList = Array.from(extractedSections).map((section) => {
      return { id: section.id, title: section.textContent };
    }) as SectionItem[];
    setSections({ items: sectionList, renderer });
  }, []);

  return sections;
}
