/**
 * Section directory component to display a dropdown menu with a list of sections on the page, with
 * sections usually meaning panels of data. The user can use the section directory to scroll to
 * the corresponding panel on the page.
 *
 * To implement a section directory on a page, the page needs to include the section directory
 * custom hook. This hook extracts the sections from the page and returns them as a list of sections
 * used to render the menu. Pass this list to the `PagePreamble` component to include the section-
 * directory trigger and menu in the upper-right corner of the page.
 *
 * Each panel on the page normally has a `<DataAreaTitle>` component to display the title of the
 * panel. To allow the panel to be a target of the section directory, add an ID that's unique on
 * the page of that panel through the `<DataAreaTitle>` `id` property.
 *
 * Example:
 * const sections = useSecDir();
 * return (
 *   <>
 *    <PagePreamble sections={sections}>
 *    <DataAreaTitle id="my-panel">My Panel</DataAreaTitle>
 *    <DataPanel>
 *      <DataArea>
 * ...
 *      </DataArea>
 *    </DataPanel>
 *  </>
 * );
 *
 * Components that display tables include their own panel ID so that they automatically appear in
 * the section directory. These components also include an optional `panelId` property to override
 * the panel's default ID if more than one of these kinds of tables appear on a page. For example:
 *
 * <SampleTable
 *   samples={item.first_samples}
 *   panelId="first-samples"
 * />
 * <SampleTable
 *   samples={item.second-samples}
 *   panelId="second-samples"
 * />
 * <FileSetTable
 *   fileSets={controlFileSets}
 *   title="Control File Sets"
 * />
 *
 * In the above example, the `<SampleTable>` components need an explicit `panelId` property because
 * more than one `<SampleTable>` component appears on the page. The `<FileSetTable>` component
 * doesn't need a `panelId` property because only one `<FileSetTable>` component appears on the
 * page, so the `<FileSetTable>` component uses its own default panel ID. However, it doesn't hurt
 * anything to add a `panelId` property to a component that doesn't need it. Just make sure all
 * panel IDs are unique on the page.
 */

// node_modules
import { useContext, useEffect, useRef, useState } from "react";
// components
import Icon from "./icon";
import { SelectMenu } from "./select-menu";
import SessionContext from "./session-context";
import { useTouchPointerType } from "./touch";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * Scroll offset; amount to lower the scroll position when scrolling to a section to account for
 * the sticky header height.
 */
const SCROLL_OFFSET = 40;

/**
 * Section directory menu close delay in milliseconds. This allows the user to move the mouse
 * outside the menu or trigger button momentarily without closing the menu.
 */
const CLOSE_DELAY = 400;

/**
 * Section anchor highlight time in milliseconds. This is the time to add a CSS class to the
 * selected section so it appears highlighted for a short time. Remove this class after this time
 * period has expired.
 */
const ANCHOR_HIGHLIGHT_TIME = 2000;

/**
 * ID of the "Top of Page" section directory item.
 */
export const SCROLL_TO_TOP_ID = "scroll-to-top";

/**
 * ID to generate a separator item in the section directory menu. This separates the "Top of Page"
 * item from the panel items in the menu.
 */
const SEPARATOR_ID = "separator-item";

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
export type SectionList = {
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
 *
 * @param id - Unique ID on the page to add to the section directory prefix
 * @returns ID with the section directory prefix, or empty string if id is empty
 */
export function secDirId(id: string): string {
  return id ? `${SEC_DIR_ID_PREFIX}-${toShishkebabCase(id)}` : "";
}

/**
 * Get all elements on the page that have a section directory ID prefix. The page must have been
 * rendered with the section directory IDs on each panel for this to work.
 *
 * @returns List of all elements on the page that have a section directory ID prefix
 */
export function getSecDirTargets(): NodeListOf<Element> {
  return document.querySelectorAll(`[id^="${SEC_DIR_ID_PREFIX}-"]`);
}

/**
 * Scroll to the section with the given ID and briefly highlight it.
 *
 * @param sectionId - ID of the DOM element to scroll to
 */
function handleSelect(sectionId: string): void {
  const element = document.querySelector(`#${sectionId}`);
  const isScrollToTop = sectionId === SCROLL_TO_TOP_ID;

  // Offset the position of the element to scroll to, allowing for the height of the sticky
  // header.
  const elementPosition = element?.getBoundingClientRect().top || 0;
  const offsetPosition = isScrollToTop
    ? 0
    : elementPosition + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  // Add a CSS class to the element to highlight it when scrolling to it. After a short time,
  // remove it.
  if (!isScrollToTop && element) {
    element.classList.add("sec-dir-highlight");
    setTimeout(() => {
      element.classList.remove("sec-dir-highlight");
    }, ANCHOR_HIGHLIGHT_TIME);
  }
}

/**
 * Displays the section directory trigger as well as its dropdown menu.
 *
 * @param sections - List of sections to display in the section directory
 */
export function SecDir({ sections }: { sections: SectionList }) {
  const isTouch = useTouchPointerType();

  // True if the user has the mouse in the section directory menu. Use ref to avoid closure issue.
  const isMouseHovered = useRef(false);

  // Get the item renderer, either the default one or the custom one passed in the sections prop.
  const ItemRenderer = sections.renderer;

  // Prepend the section directory menu with a "Top of Page" item to allow the user to scroll to the
  // top of the page.
  const sectionItemsWithScrollToTop = [
    {
      id: SCROLL_TO_TOP_ID,
      title: "Top of Page",
    },
    {
      id: SEPARATOR_ID,
      title: "",
    },
    ...sections.items,
  ];

  /**
   * Called when the mouse enters the section directory menu or its trigger button.
   */
  function onPointerEnter() {
    isMouseHovered.current = true;
  }

  /**
   * Called when the mouse leaves the section directory menu or its trigger button. Delays a bit
   * before closing the menu to allow overzealous mouse movement.
   * @param close Function to close the section-directory menu
   */
  function onPointerLeave(close: () => void) {
    if (!isTouch) {
      isMouseHovered.current = false;
      setTimeout(() => {
        // Check the hover flag in case the user re-entered the menu before the delay expired.
        if (!isMouseHovered.current) {
          close();
        }
      }, CLOSE_DELAY);
    }
  }

  /**
   * Called when the user selects a section to scroll to. It also closes the section-directory menu
   * on touch devices. The menu gets closed using hover on non-touch devices.
   *
   * @param event - React mouse event from clicking the menu item
   * @param sectionId - ID of the section to scroll to
   * @param close - Function to close the section-directory menu
   */
  function onItemClick(
    event: React.MouseEvent,
    sectionId: string,
    close: () => void
  ) {
    event.preventDefault();
    if (isTouch) {
      close();
    }
    handleSelect(sectionId);
  }

  return (
    <SelectMenu className="mb-0.5">
      {({ close }) => (
        <>
          <SelectMenu.Trigger
            onMouseEnter={onPointerEnter}
            onMouseLeave={() => onPointerLeave(close)}
          >
            <Icon.SectionDirectory className="h-4 w-4" />
            <div>Page Navigator</div>
          </SelectMenu.Trigger>
          <SelectMenu.Items
            justify="right"
            onMouseEnter={onPointerEnter}
            onMouseLeave={() => {
              onPointerLeave(close);
            }}
          >
            {sectionItemsWithScrollToTop.map((section) =>
              section.id === SEPARATOR_ID ? (
                <SelectMenu.Separator key={section.id} />
              ) : (
                <SelectMenu.Item
                  key={section.id}
                  onClick={(e) => onItemClick(e, section.id, close)}
                >
                  {ItemRenderer ? (
                    <ItemRenderer
                      section={section}
                      allSections={sections.items}
                    />
                  ) : (
                    section.title
                  )}
                </SelectMenu.Item>
              )
            )}
          </SelectMenu.Items>
        </>
      )}
    </SelectMenu>
  );
}

/**
 * Custom hook to include on pages that have a section directory. Extracts the sections from the
 * page and returns them as a list of section items. The first time this gets called at render, it
 * could return an empty array. This updates to the real list once the page has rendered.
 *
 * This normally extracts the text for the section titles from the panel titles on the page. If the
 * section titles are not the same as the panel titles, you add a `data-sec-dir` attribute to the
 * panel title element with the text to use for the section title.
 *
 * If the section titles can change as the page loads or any other reason, you can pass an
 * arbitrary string in `hash` to this hook to collect the section titles again whenever the hash
 * changes. If you don't pass a hash, this hook will only collect the sections once on page load.
 *
 * The `isJson` property can be used in place of `hash` to trigger collecting the sections, but
 * specifically for the JSON switch. This is useful when the page has a JSON switch that changes
 * the content of the page, and you want to collect the sections again when the user switches
 * between JSON and object formats. `hash` is ignored if `isJson` is provided with either `true`
 * or `false` values.
 *
 * @param renderer - React component to render each item in the section directory menu
 * @param hash - Hash to use to trigger this hook to collect the sections again
 * @param isJson - Use in place of `hash` to trigger collecting the sections, but for the JSON switch
 * @returns List of sections on the page to pass to SecDir
 */
export function useSecDir({
  renderer,
  hash = "",
  isJson,
}: {
  renderer?: RendererComponent;
  hash?: string;
  isJson?: boolean;
} = {}): SectionList {
  // If isJson is provided (true or false), use it as the basis for the hash. Otherwise use the
  // hash (if any) as is.
  const resolvedHash =
    typeof isJson === "boolean" ? (isJson ? "json" : "object") : hash;

  // Use the session properties `auth.userid` property to detect the user login so we can update
  // the section directory in case new panels appear.
  const { sessionProperties } = useContext(SessionContext);
  const userName = sessionProperties?.["auth.userid"] || "";

  // State to hold the list of sections to display in the section directory
  const [sections, setSections] = useState<SectionList>({
    items: [],
    renderer: undefined,
  });

  useEffect(() => {
    // Get all elements on the page with a section directory ID prefix.
    const extractedSections = getSecDirTargets();

    // Extract the ID and title of each section to build a list of sections that the directory can
    // use.
    const sectionList = Array.from(extractedSections).map((section) => {
      const title =
        section.getAttribute("data-sec-dir") || section.textContent!;
      return { id: section.id, title };
    }) as SectionItem[];
    setSections({ items: sectionList, renderer });
  }, [resolvedHash, userName]);

  return sections;
}
