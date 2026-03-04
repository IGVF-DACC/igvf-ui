/**
 * Maps a page "Component" block to a React component so that portions of the page can include
 * dynamic content, or to provide a more convenient way to enter complicated content.
 *
 * The content creator can make a "Component" block in the editor and then use a component label
 * agreed upon by the content creator and the dev to refer to a specific React component to display
 * at a location within the page -- called here a "page plugin component." The component label can
 * contain uppercase letters, digits, and underscores.
 *
 * Also agree on what properties the page plugin component expects. Those properties get listed in
 * separate lines after the component label, and use a "key=value" format. As an example, a
 * component label is "SAMPLE COUNT" and takes the properties "label" and "color". The content
 * creator then puts the following text into a "Component" block in the editor:
 *
 * SAMPLE_COUNT
 * label=Sample Count
 * color=gray
 *
 * If the `componentMap` object maps "SAMPLE COUNT" to the React component <SampleCount>, then that
 * component gets called like this:
 *
 * <SampleCount label="Sample Count" color="gray" />
 *
 * Its rendered output gets placed in the page at the location of the "Component" block.
 *
 * Try to write the plugin component to not crash the page if the text in the block doesn't make
 * sense. Generally, any Component block contents that can't be parsed get ignored.
 */

// node_modules
import type { ComponentType } from "react";
// components/page-components
import ButtonNavigation from "./button-navigation";
import ChevronNavigation from "./chevron-navigation";
import ImageAligned from "./image-aligned";
import PageNavigation from "./page-navigation";
import SampleCount from "./sample-count";
import VideoYouTube from "./video-youtube";

/**
 * The page plugin components in this directory can take any properties, but they must all be
 * strings because the content creator enters them as text in the editor.
 */
type PluginProps = Record<string, string>;

/**
 * The type of all page components in this directory. Each page component must be a React component
 * that takes a `PluginProps` object as its props.
 */
type PluginComponent = ComponentType<PluginProps>;

/**
 * When adding new page plugin components, define the corresponding React components in this
 * directory -- likely in a new file though not necessarily. Decide on the component label the
 * content creator can use to reference the component and map it to the actual component name in
 * this object.
 */
const componentMap: Record<string, PluginComponent> = {
  BUTTON_NAV: ButtonNavigation,
  CHEVRON_NAV: ChevronNavigation,
  IMAGE_ALIGNED: ImageAligned,
  PAGE_NAV: PageNavigation,
  SAMPLE_COUNT: SampleCount,
  VIDEO_YOUTUBE: VideoYouTube,
} as const;

/**
 * The type of the component labels that content creators can use to reference page plugin
 * components.
 */
type ComponentLabel = keyof typeof componentMap;

/**
 * Type guard to check if a string is a valid component label that content creators can use to
 * reference page components.
 *
 * @param label - Component label used by content creators; key of `componentMap`
 * @returns True if `label` matches a key of `componentMap`
 */
function isComponentLabel(label: string): label is ComponentLabel {
  return label in componentMap;
}

/**
 * Parses the lines of properties from the content creator into an object mapping property keys to
 * their corresponding values. Each line of properties is expected to be in the format "key=value".
 * Ignore lines that don't match this format.
 *
 * @param propLines - Lines of properties from the content creator: "key=value"
 * @returns Object mapping property keys to their corresponding values
 */
function parsePropLines(propLines: string[]): PluginProps {
  return propLines.reduce<PluginProps>((acc, line) => {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (key.length > 0) {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
}

/**
 * Entry point to all page plugin components. `spec` contains the entire contents of a "Component"
 * block in the page editor. The first line of `spec` contains the component label, and the rest of
 * the lines contain properties to pass to the actual page component.
 */
export default function PageComponent({ spec }: { spec: string }) {
  // Parse the component label and properties from the `spec` string. The component label is the
  // first line of `spec`, and the properties are the rest of the lines.
  const [componentLabel, ...rest] = spec
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Valid component labels trigger calling the corresponding page component with the properties
  // parsed from `spec`. Invalid component labels get ignored and render nothing.
  if (componentLabel && isComponentLabel(componentLabel)) {
    // Map the component label to the matching page plugin component.
    const Component = componentMap[componentLabel];

    // Build an object from the key/value pairs in the spec and pass these to the mapped page
    // plugin component.
    const pluginProps = parsePropLines(rest);
    return <Component {...pluginProps} />;
  }

  return null;
}
