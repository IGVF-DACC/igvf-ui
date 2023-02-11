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
import PropTypes from "prop-types";
// components/page-components
import ImageAligned from "./image-aligned";
import PageNavigation from "./page-navigation";
import SampleCount from "./sample-count";
import VideoYouTube from "./video-youtube";

/**
 * When adding new page plugin components, define the corresponding React components in this
 * directory -- likely in a new file though not necessarily. Decide on the component label the
 * content creator can use to reference the component and map it to the actual component name in
 * this object.
 */
const componentMap = {
  IMAGE_ALIGNED: ImageAligned,
  PAGE_NAV: PageNavigation,
  SAMPLE_COUNT: SampleCount,
  VIDEO_YOUTUBE: VideoYouTube,
};

/**
 * Entry point to all page plugin components. `spec` contains the entire contents of a "Component"
 * block in the page editor. The first line of `spec` contains the component label, and the rest of
 * the lines contain properties to pass to the actual page component.
 */
export default function PageComponent({ spec }) {
  // Extract the component label and its properties from the spec.
  const specParts = spec.split("\n").filter((specPart) => specPart !== "");
  const componentLabel = specParts.splice(0, 1)[0];

  // Map the component label to the matching page plugin component.
  if (componentLabel.match(/^[A-Z0-9_]+$/) !== null) {
    const Component = componentMap[componentLabel];

    // Build an object from the key/value pairs in the spec and pass these to the mapped page
    // plugin component.
    if (Component) {
      const pluginProps = specParts.reduce((acc, part) => {
        const [key, value] = part.split("=");
        acc[key] = value;
        return acc;
      }, {});
      return <Component {...pluginProps} />;
    }
  }

  return null;
}

PageComponent.propTypes = {
  // React component specification from a "Component" block on a page
  spec: PropTypes.string.isRequired,
};
